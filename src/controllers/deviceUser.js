const Device = require('../models/Device');
const DeviceParam = require('../models/DeviceParam');
const DeviceAttr = require('../models/DeviceAttr');
const DeviceStatus = require('../models/DeviceStatus');
const DeviceCategoryItem = require('../models/DeviceCategoryItem');

const mqttClient = require('../middleware/mqttClient');
const deviceHash = require('../utils/hash');
const getJWTPayload = require('../utils/jsonWebToken').getJWTPayload;
const APIError = require('../middleware/rest').APIError;

// set
// 添加设备
const setDevice = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError('device: set_device_unknown_error', `系统未知错误`);
	}

	await Promise.all([
		new Device({
			groupId: reqData.groupId,
			roomId: reqData.roomId,
			categoryItemId: reqData.categoryItemId,
			deviceId: reqData.deviceId,
			name: reqData.name,
			desc: reqData.desc,
			os: reqData.os,
			networking: reqData.networking,
			protocol: reqData.protocol,
		}).save(),
		new DeviceStatus({
			deviceId: reqData.deviceId,
			onLine: false,
			status: reqData.status,
		}).save(),
		DeviceCategoryItem.findOne({ categoryItemId: reqData.categoryItemId }),
	])
		.then(docs => {
			const resData = {
				device: {
					groupId: docs[0].groupId,
					roomId: docs[0].roomId,
					deviceId: docs[0].deviceId,
					categoryId: docs[2].categoryId,
					categoryItemId: docs[0].categoryItemId,
					categoryItemName: docs[2].name,
					name: docs[0].name,
					desc: docs[0].desc,
					networking: docs[0].networking,
					os: docs[0].os,
					protocol: docs[0].protocol,
					onLine: docs[1].onLine,
					createTime: docs[0].createTime,
					updateTime: docs[1].updateTime,
				},
				status: docs[1].status,
			};

			io.to(reqData.groupId).emit('addDevice', resData);
			ctx.rest({
				ok: true,
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

const setDesired = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];

	if (!reqData) {
		throw new APIError('device: set_desired_unknown_error', `系统未知错误`);
	}
	try {
		await mqttClient.MQTTPublish(
			payload.groupId,
			reqData.deviceId,
			reqData.desired
		);
		ctx.rest({ ok: true });
	} catch (error) {
		console.log(error);
		throw new APIError('device: database_error', `系统未知错误`);
	}
};

// put
const updateDevice = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: update_device_unknown_error',
			`系统未知错误`
		);
	}

	const docs = await Device.findOneAndUpdate(
		{
			deviceId: reqData.deviceId,
		},
		reqData.data,
		{
			new: true,
		}
	).catch(error => {
		console.log(error);
		throw new APIError('device: update_device_failed', '更新失败');
	});
	if (docs) {
		ctx.rest({
			groupId: docs.groupId,
			roomId: docs.roomId,
			categoryItemId: docs.categoryItemId,
			deviceId: docs.deviceId,
			name: docs.name,
			desc: docs.desc,
			os: docs.os,
			networking: docs.networking,
			protocol: docs.protocol,
		});
	} else {
		throw new APIError(
			'device: update_device_failed',
			'设备不存在，请重试'
		);
	}
};

// delete
// 删除设备
const deleteDevice = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_unknown_error',
			`系统未知错误`
		);
	}
	await Promise.all([
		Device.deleteOne({
			groupId: reqData.groupId,
			deviceId: reqData.deviceId,
		}),
		DeviceStatus.deleteOne({
			deviceId: reqData.deviceId,
		}),
	])
		.then(docs => {
			io.to(reqData.groupId).emit('deleteDevice', {
				deviceId: reqData.deviceId,
			});
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: delete_device_failed', '删除失败');
		});
};

// get
// 获取用户所有的设备信息
const getAllDeviceInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: get_all_device_info_unknown_error',
			`系统未知错误`
		);
	}

	await Device.aggregate([
		{
			$match: { groupId: reqData.groupId },
		},
		{
			$lookup: {
				from: 'deviceStatus',
				localField: 'deviceId',
				foreignField: 'deviceId',
				as: 'status',
			},
		},
		{
			$lookup: {
				from: 'deviceCategoryItems',
				localField: 'categoryItemId',
				foreignField: 'categoryItemId',
				as: 'category',
			},
		},
		{
			$unwind: {
				path: '$status', // 拆分子数组
				preserveNullAndEmptyArrays: true, // 空的数组也拆分
			},
		},
		{
			$unwind: {
				path: '$category', // 拆分子数组
				preserveNullAndEmptyArrays: true, // 空的数组也拆分
			},
		},
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备参数与属性
const getDeviceParamAndAttrById = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: get_dpeviceParam_and_attr_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await deviceParamAndAttr(reqData)
		.then(docs => {
			// console.log(docs);
			if (!docs[0].categoryItemId) {
				ctx.rest(docs);
				return;
			}
			ctx.rest({
				categoryItemId: docs[0].categoryItemId,
				param: docs[0].param,
				attr: docs[0].attrData.attr,
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备 Id
const getDeviceId = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);
	const deviceId = deviceHash.hmacDevideId(payload.userId).substr(0, 20);
	ctx.rest({
		deviceId: deviceId,
	});
};

const deviceParamAndAttr = query => {
	return DeviceParam.aggregate([
		{
			$lookup: {
				from: 'deviceAttrs',
				localField: 'categoryItemId',
				foreignField: 'categoryItemId',
				as: 'attrData',
			},
		},
		{
			$match: query,
		},
		{
			$project: { 'param._id': 0, 'attrData.attr._id': 0 },
		},
		{
			$unwind: {
				path: '$attrData', // 拆分子数组
				preserveNullAndEmptyArrays: true, // 空的数组也拆分
			},
		},
	]);
};

module.exports = {
	// 添加设备
	'POST /api/device/setDevice': setDevice,
	// 操作设备
	'POST /api/device/setDesired': setDesired,

	// 更新设备参数
	'PUT /api/device/updateDevice': updateDevice,

	// 删除设备
	'DELETE /api/device/deleteDevice': deleteDevice,

	// 获取 groupId 下所有的设备信息
	'GET /api/device/getAllDeviceInfo': getAllDeviceInfo,

	// 获取设备信息
	// 'GET /api/device/getDeviceInfoById': getDeviceInfo,

	// 获取设备参数与属性
	'GET /api/device/getDeviceParamAndAttrById': getDeviceParamAndAttrById,

	// 获取设备 Id
	'GET /api/device/getDeviceId': getDeviceId,
};
