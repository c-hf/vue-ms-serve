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
			deviceId: reqData.id,
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
};
