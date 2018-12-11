const Device = require('../models/Device');
const DeviceCategory = require('../models/DeviceCategory');
const DeviceCategoryItem = require('../models/DeviceCategoryItem');
const DeviceParam = require('../models/DeviceParam');
const DeviceAttr = require('../models/DeviceAttr');

const getJWTPayload = require('../utils/jsonWebToken').getJWTPayload;

const APIError = require('../middleware/rest').APIError;

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
		new DeviceCategory(reqData).save();
		resData = 'ok';
	} catch (error) {
		console.log(error);
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

	await Promise.all([
		new DeviceCategoryItem({
			categoryId: reqData.categoryId,
			categoryItemId: reqData.categoryItemId,
			name: reqData.name,
		}).save(),
		new DeviceAttr({
			categoryItemId: reqData.categoryItemId,
			attr: [],
		}).save(),
		new DeviceParam({
			categoryItemId: reqData.categoryItemId,
			param: [],
		}).save(),
	])
		.then(() => {
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
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

	await DeviceParam.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
		},
		{
			$push: {
				param: reqData.data,
			},
		}
	)
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 添加设备属性
const setDeviceAttr = async (ctx, next) => {
	let reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: set_device_attr_unknown_error',
			`系统未知错误`
		);
	}
	await DeviceAttr.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
		},
		{
			$push: {
				attr: reqData.data,
			},
		}
	)
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// put
// 更新分类
const updateDeviceCategory = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: update_device_category_unknown_error',
			`系统未知错误`
		);
	}
	let resData;
	await DeviceCategory.updateOne(
		{
			categoryId: reqData.categoryId,
		},
		reqData
	)
		.then(docs => {
			// console.log(docs);
			resData = 'ok';
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
	ctx.rest(resData);
};

// 更新分类项
const updateDeviceCategoryItem = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData.categoryItemId) {
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
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
	ctx.rest(resData);
};

// 更新设备参数
const updateDeviceParam = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData.categoryItemId) {
		throw new APIError(
			'device: update_device_category_item_unknown_error',
			`系统未知错误`
		);
	}

	await DeviceParam.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
			'param.id': reqData.data.id,
		},
		{
			$set: {
				'param.$': reqData.data,
			},
		}
	)
		.then(docs => {
			// console.log(docs);
			resData = 'ok';
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
	ctx.rest(resData);
};

// 更新设备属性
const updateDeviceAttr = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData.categoryItemId) {
		throw new APIError(
			'device: update_device_category_item_unknown_error',
			`系统未知错误`
		);
	}

	await DeviceAttr.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
			'attr.id': reqData.data.id,
		},
		{
			$set: {
				'attr.$': reqData.data,
			},
		}
	)
		.then(docs => {
			// console.log(docs);
			resData = 'ok';
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
	ctx.rest(resData);
};

// delete
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
		DeviceCategoryItem.findOne({ categoryId: reqData.id }).then(docs => {
			docs.forEach(el => {
				Promise.all([
					DeviceParam.deleteOne({
						categoryItemId: el.categoryItemId,
					}),
					DeviceAttr.deleteOne({ categoryItemId: el.categoryItemId }),
				]);
			});
		}),
		DeviceCategory.deleteOne({ categoryId: reqData.id }),
		DeviceCategoryItem.deleteMany({ categoryId: reqData.id }),
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
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
	await Promise.all([
		DeviceCategoryItem.deleteOne({ categoryItemId: reqData.id }),
		DeviceParam.deleteOne({ categoryItemId: reqData.id }),
		DeviceAttr.deleteOne({ categoryItemId: reqData.id }),
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError(
				'device: delete_device_category_item_failed',
				'删除失败'
			);
		});
};

// 删除设备参数
deleteDeviceParam = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_category_unknown_error',
			`系统未知错误`
		);
	}
	await DeviceParam.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
		},
		{
			$pull: {
				param: {
					id: reqData.id,
				},
			},
		}
	)
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 删除设备属性
deleteDeviceAttr = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_category_unknown_error',
			`系统未知错误`
		);
	}
	await DeviceAttr.updateOne(
		{
			categoryItemId: reqData.categoryItemId,
		},
		{
			$pull: {
				attr: {
					id: reqData.id,
				},
			},
		}
	)
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// get
// 获取分类设备信息
const getDeviceCategoryInfo = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);
	await DeviceCategory.aggregate([
		{
			$lookup: {
				from: 'deviceCategoryItems',
				localField: 'categoryId',
				foreignField: 'categoryId',
				as: 'categoryItem',
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
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备参数
const getAllDeviceParam = async (ctx, next) => {
	await DeviceParam.find()
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备属性
const getAllDeviceAttr = async (ctx, next) => {
	await DeviceAttr.find()
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('device: database_error', `系统未知错误`);
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
		.catch(error => {
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

	// 更新分类
	'PUT /api/device/updateDeviceCategory': updateDeviceCategory,
	// 更新分类项
	'PUT /api/device/updateDeviceCategoryItem': updateDeviceCategoryItem,
	// 更新设备参数
	'PUT /api/device/updateDeviceParam': updateDeviceParam,
	// 更新设备属性
	'PUT /api/device/updateDeviceAttr': updateDeviceAttr,

	// 删除分类
	'DELETE /api/device/deleteDeviceCategory': deleteDeviceCategory,
	// 删除分类项
	'DELETE /api/device/deleteDeviceCategoryItem': deleteDeviceCategoryItem,
	// 删除设备参数
	'DELETE /api/device/deleteDeviceParam': deleteDeviceParam,
	// 删除设备属性
	'DELETE /api/device/deleteDeviceAttr': deleteDeviceAttr,

	// 获取所有分类与分类设备信息
	'GET /api/device/getDeviceCategoryInfo': getDeviceCategoryInfo,
	// 获取所有设备参数
	'GET /api/device/getAllDeviceParam': getAllDeviceParam,
	// 获取所有设备属性
	'GET /api/device/getAllDeviceAttr': getAllDeviceAttr,

	// 设备相关项 Id 是否唯一
	'GET /api/device/getDeviceUnique': getDeviceUnique,
};
