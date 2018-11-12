const jwt = require('jsonwebtoken');

const Device = require('../models/Device');
const DeviceCategory = require('../models/DeviceCategory');
const DeviceCategoryItem = require('../models/DeviceCategoryItem');
const DeviceAttr = require('../models/DeviceAttr');
const DeviceParam = require('../models/DeviceParam');

const deviceHash = require('../utils/hash');
const jwtSecret = require('../config/index').jwtSecret; // jwt密钥
const APIError = require('../middleware/rest').APIError;

// 解析JWT
function getJWTPayload(token) {
	return jwt.verify(token.split(' ')[1], jwtSecret);
}

// set
// 添加分类
const setDeviceCategory = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	try {
		new DeviceCategory({
			categoryId: reqData.id,
			name: reqData.name,
		}).save();
		resData = 'ok';
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest(resData);
};

// 添加分类项
const setDeviceCategoryItem = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	try {
		new DeviceCategoryItem({
			categoryId: reqData.categoryId,
			categoryItemId: reqData.categoryItemId,
			name: reqData.name,
		}).save();
		resData = 'ok';
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest(resData);
};

// 添加设备参数
const setDeviceParam = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	try {
		new DeviceParam({
			categoryItemId: reqData.categoryItemId,
			param: reqData.param,
		}).save();
		resData = 'ok';
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest(resData);
};

// 添加设备属性
const setDeviceAttr = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	try {
		new DeviceAttr({
			categoryItemId: reqData.categoryItemId,
			param: reqData.param,
		}).save();
		resData = 'ok';
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest(resData);
};

// 添加设备
const setDevice = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	try {
		new Device({
			categoryItemId: reqData.categoryItemId,
			// param: reqData.param,
		}).save();
		resData = 'ok';
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest(resData);
};

// 更新分类
const updateDeviceCategory = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: update_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	await DeviceCategoryItem.updateOne(
		{
			categoryId: reqData.categoryId,
		},
		reqData
	)
		.then(docs => {
			// console.log(docs);
			resData = 'ok';
		})
		.catch(err => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
	ctx.rest(resData);
};

// 更新分类项
const updateDeviceCategoryItem = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: update_device_category_item_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	await DeviceCategoryItem.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
		},
		reqData
	)
		.then(docs => {
			// console.log(docs);
			resData = 'ok';
		})
		.catch(err => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
	ctx.rest(resData);
};

// 删除分类
const deleteDeviceCategory = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_category_unknown_error',
			`系统未知错误`
		);
	}
	await Promise.all([
		DeviceCategory.deleteOne({ categoryId: reqData.id }),
		DeviceCategoryItem.deleteMany({ categoryId: reqData.id }),
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(err => {
			throw new APIError(
				'device: delete_device_category_failed',
				'删除失败'
			);
		});
};

// 删除分类项
const deleteDeviceCategoryItem = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_category_item_unknown_error',
			`系统未知错误`
		);
	}
	await DeviceCategoryItem.deleteOne({ categoryItemId: reqData.id })
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(err => {
			throw new APIError(
				'device: delete_device_category_item_failed',
				'删除失败'
			);
		});
};

// get
// 获取分类信息
// const getDeviceCategoryInfo = async (ctx, next) => {};

// 获取分类设备信息
const getDeviceCategoryInfo = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);
	const userData = await DeviceCategory.aggregate([
		{
			$lookup: {
				from: 'deviceCategoryItems',
				localField: 'categoryId',
				foreignField: 'categoryId',
				as: 'categoryItem',
			},
		},
		// {
		// 	$match: query,
		// },
		{
			$project: {
				_id: 0,
			},
		},
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(err => {
			// console.log(err);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备参数与属性
const getDeviceParamAndAttrInfo = async (ctx, next) => {
	const [payload, query] = [
		getJWTPayload(ctx.headers.authorization),
		{ categoryItemId: ctx.params.id },
	];

	const userData = await DeviceParam.aggregate([
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
			$project: {
				_id: 0,
			},
		},
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(err => {
			// console.log(err);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取 userId 下所有的设备信息
const getAllDeviceInfo = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);
	const query = { id: payload.id };
	const userData = await DeviceParam.find([
		{
			$match: query,
		},
		{
			$lookup: {
				from: 'devices',
				localField: 'categoryItemId',
				foreignField: 'categoryItemId',
				as: 'attrData',
			},
		},
		{
			$lookup: {
				from: 'lights',
				localField: 'DeviceId',
				foreignField: 'DeviceId',
				as: 'lights',
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(err => {
			// console.log(err);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

const getDeviceInfo = async (ctx, next) => {};

// 获取设备 Id
const getDeviceId = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);

	const deviceId = deviceHash.hmacDevideId(payload.id);
	ctx.rest({
		deviceId: deviceId,
	});
};

// 设备相关项 Id 是否唯一
const getDeviceUnique = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: get_device_unique_unknown_error',
			`系统未知错误`
		);
	}
	const model = {
		category: DeviceCategory,
		categoryItem: DeviceCategoryItem,
	};

	const queryId = `${reqData.type}Id`;
	let query = {};
	query[queryId] = reqData.id;

	await model[reqData.type]
		.findOne(query)
		.catch(err => {
			throw new APIError('device: database_error', `系统未知错误`);
		})
		.then(docs => {
			if (!docs) {
				ctx.rest('ok');
			} else {
				const name = {
					category: '分类 ID',
					categoryItem: '分类设备 ID',
				};
				throw new APIError(
					`device: ${reqData.type}Id_already_exist`,
					`${name[reqData.type]} 已存在`
				);
			}
		});
};

module.exports = {
	// 添加分类
	'POST /api/device/setDeviceCategory': setDeviceCategory,
	// 添加分类项
	'POST /api/device/setDeviceCategoryItem': setDeviceCategoryItem,
	// 添加设备参数
	'POST /api/device/setDeviceParam': setDeviceParam,
	// 添加设备属性
	'POST /api/device/setDeviceAttr': setDeviceAttr,
	// 添加设备
	'POST /api/device/setDevice': setDevice,

	// 更新分类
	'PUT /api/device/updateDeviceCategory': updateDeviceCategory,
	// 更新分类项
	'PUT /api/device/updateDeviceCategoryItem': updateDeviceCategoryItem,
	// // 更新设备参数
	// 'PUT /api/device/updateDeviceParam': updateDeviceParam,
	// // 更新设备属性
	// 'PUT /api/device/updateDeviceAttr': updateDeviceAttr,

	// 删除分类
	'DELETE /api/device/deleteDeviceCategory': deleteDeviceCategory,
	// 删除分类项
	'DELETE /api/device/deleteDeviceCategoryItem': deleteDeviceCategoryItem,

	// 获取分类与分类设备信息
	'GET /api/device/getDeviceCategoryInfo': getDeviceCategoryInfo,
	// 获取分类设备信息
	// 'GET /api/device/getDeviceInfo': getDeviceInfo,

	// 获取设备参数与属性
	'GET /api/device/getDeviceParamAndAttrInfo/:id': getDeviceParamAndAttrInfo,
	// 获取设备属性
	// 'GET /api/device/getDeviceAttr': getDeviceAttr,
	// 获取 userId 下所有的设备信息
	'GET /api/device/getAllDeviceInfo': getAllDeviceInfo,
	// 获取 拥有本设备id 的设备信息
	'GET /api/device/getDeviceInfo/:deviceId': getDeviceInfo,
	// 获取设备 Id
	'GET /api/device/getDeviceId': getDeviceId,

	// 设备相关项 Id 是否唯一
	'GET /api/device/getDeviceUnique': getDeviceUnique,
};
