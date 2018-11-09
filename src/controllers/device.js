const jwt = require('jsonwebtoken');

const DeviceCategory = require('../models/DeviceCategory');
const DeviceCategoryItem = require('../models/DeviceCategoryItem');
const deviceHash = require('../utils/hash');

const jwtSecret = require('../config/index').jwtSecret; // jwt密钥
const APIError = require('../middleware/rest').APIError;

// 解析JWT
function getJWTPayload(token) {
	return jwt.verify(token.split(' ')[1], jwtSecret);
}

// 添加分类
const setDeviceCategory = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	try {
		new DeviceCategory({
			categoryId: reqData.id,
			name: reqData.name,
		}).save();
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest('ok');
};

// 添加分类项
const setDevice = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_category_unknown_error',
			`系统未知错误`
		);
	}
	try {
		new DeviceCategoryItem({
			categoryId: reqData.categoryId,
			deviceId: reqData.id,
			name: reqData.name,
		}).save();
	} catch (error) {
		console.log(err);
		throw new APIError('device: database_error', `系统未知错误`);
	}
	ctx.rest('ok');
};

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
			throw new APIError('sign: database_error', `系统未知错误`);
		});
};

const getDeviceId = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);

	const deviceId = deviceHash.hmacDevideId(payload.id);
	ctx.rest({
		deviceId: deviceId,
	});
};

module.exports = {
	// 设备分类
	// 'POST /api/device/deviceCategoryInfo': deviceCategoryInfo,
	// 添加分类
	'POST /api/device/setDeviceCategory': setDeviceCategory,
	// 添加分类项
	'POST /api/device/setDevice': setDevice,
	// 获取分类信息
	'GET /api/device/getDeviceCategoryInfo': getDeviceCategoryInfo,
	// 获取设备信息
	// 'GET /api/device/getDeviceInfo': getDeviceInfo,

	'GET /api/device/getDeviceId': getDeviceId,
};
