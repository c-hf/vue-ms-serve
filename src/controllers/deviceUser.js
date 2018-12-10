const Device = require('../models/Device');
const DeviceParam = require('../models/DeviceParam');
const DeviceAttr = require('../models/DeviceAttr');
const DeviceStatus = require('../models/DeviceStatus');
const DeviceCategoryItem = require('../models/DeviceCategoryItem');

const deviceHash = require('../utils/hash');
const getJWTPayload = require('../utils/jsonWebToken').getJWTPayload;
const APIError = require('../middleware/rest').APIError;
// const io = require('../middleware/websocketServer').io;

// updateDeviceStatus;
// addDevice;
// deleteDevice;
// updateDevice;

// set
// 添加设备
const setDevice = async (ctx, next) => {
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.body,
	];

	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
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
	])
		.then(docs => {
			const device = {
				groupId: docs[0].groupId,
				categoryItemId: docs[0].categoryItemId,
				deviceId: docs[0].deviceId,
				roomId: docs[0].roomId,
				name: docs[0].name,
				desc: docs[0].desc,
				networking: docs[0].networking,
				os: docs[0].os,
				protocol: docs[0].protocol,
				onLine: docs[1].onLine,
				status: docs[1].status,
				createTime: docs[0].createTime,
				updateTime: docs[1].updateTime,
			};
			io.to(reqData.groupId).emit('addDevice', device);

			ctx.rest({
				ok: true,
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// put

// delete
// 删除设备
const deleteDevice = async (ctx, next) => {
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.query,
	];
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
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.query,
	];
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
	const [payload, query] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.query,
	];

	await deviceParamAndAttr(query)
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
