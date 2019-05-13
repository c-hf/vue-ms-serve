const Device = require('../models/Device');
const DeviceLog = require('../models/DeviceLog');
const DeviceParam = require('../models/DeviceParam');
const DeviceAttr = require('../models/DeviceAttr');
const DeviceStatus = require('../models/DeviceStatus');
const DeviceCategory = require('../models/DeviceCategory');
const DeviceCategoryItem = require('../models/DeviceCategoryItem');
const DeviceTimedTask = require('../models/DeviceTimedTask');
const DeviceAssociate = require('../models/DeviceAssociate');

const mqttClient = require('../middleware/mqttClient');
const deviceHash = require('../utils/hash');
const schedule = require('../utils/schedule');
const getJWTPayload = require('../utils/jsonWebToken').getJWTPayload;
const APIError = require('../middleware/rest').APIError;
const setDesiredLog = require('../utils/logKit').setDesiredLog;
const getId = require('../utils/getId');
const getMessageId = require('../utils/getMessageId');
const uuid = require('uuid');

// set
// 添加设备
const setDevice = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError('device: set_device_unknown_error', `系统未知错误`);
	}

	const docs = await Promise.all([
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
			groupId: reqData.groupId,
			deviceId: reqData.deviceId,
			onLine: false,
			status: reqData.status,
		}).save(),
		DeviceCategoryItem.aggregate([
			{
				$match: { categoryItemId: reqData.categoryItemId },
			},
			{
				$lookup: {
					from: 'deviceCategorys',
					localField: 'categoryId',
					foreignField: 'categoryId',
					as: 'categoryInfo',
				},
			},
			{
				$unwind: {
					path: '$categoryInfo',
					preserveNullAndEmptyArrays: true,
				},
			},
		]),
	]).catch(error => {
		console.log(error.message);
		throw new APIError('device: database_error', `系统未知错误`);
	});

	const resData = {
		device: {
			groupId: docs[0].groupId,
			roomId: docs[0].roomId,
			deviceId: docs[0].deviceId,
			categoryId: docs[2][0].categoryId,
			categoryName: docs[2][0].categoryInfo.name,
			categoryItemId: docs[0].categoryItemId,
			categoryItemName: docs[2][0].name,
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
	// const messageId = getMessageId();
	// const [message, relation] = [
	// 	{
	// 		messageId: messageId,
	// 		category: 'DEVICE',
	// 		type: 'INFO',
	// 		title: '添加设备通知',
	// 		content: '添加了新设备',
	// 		sender: 'system',
	// 		operation: {
	// 			deviceType: 'add',
	// 			userId: payload.userId,
	// 			deviceId: reqData.deviceId,
	// 			name: reqData.name,
	// 			operation: false,
	// 		},
	// 	},
	// 	{
	// 		messageId: messageId,
	// 		userId: reqData.sourceId,
	// 		status: 'UNREAD',
	// 	},
	// ];

	io.to(reqData.groupId).emit('updateDevices', {
		type: 'add',
		data: resData,
	});
	ctx.rest({
		ok: true,
	});
};

// 操作设备
const setDesired = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];

	if (!reqData) {
		throw new APIError('device: set_desired_unknown_error', `系统未知错误`);
	}

	try {
		const desiredId = getId(15);
		await Promise.all([
			mqttClient.MQTTPublish(
				payload.groupId,
				reqData.deviceId,
				reqData.desired
			),
			setDesiredLog({
				logId: desiredId,
				groupId: payload.groupId,
				deviceId: reqData.deviceId,
				source: 'User',
				logType: 'info',
				desired: reqData.desired,
			}),
		]);
		ctx.rest({ ok: true });
	} catch (error) {
		console.log(error.message);
		throw new APIError('device: database_error', `系统未知错误`);
	}
};

// 设置定时任务
const setDeviceTimedTask = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'device: set_device_timed_task_unknown_error',
			`系统未知错误`
		);
	}
	try {
		const timedTaskId = getId(15);
		await Promise.all([
			schedule.setTimedTask({
				name: reqData.name,
				userId: payload.userId,
				groupId: payload.groupId,
				deviceId: reqData.deviceId,
				timedTaskId: timedTaskId,
				time: reqData.time,
				desired: reqData.desired,
			}),
		]).then(docs => {
			ctx.rest(docs[0]);
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('device: database_error', `系统未知错误`);
	}
};

// 设置关联设备
const setDeviceAssociate = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'device: set_device_associate_unknown_error',
			`系统未知错误`
		);
	}
	const associateId = uuid.v1();
	await new DeviceAssociate({
		associateId: associateId, // 关联 ID
		groupId: payload.groupId, // 群组 ID
		deviceId: reqData.deviceId, // 设备 ID
		condition: {
			// 关联设备触发条件
			id: reqData.condition.id,
			value: reqData.condition.value,
		},
		// associatedDeviceId: String, // 关联设备 ID
		// expect: {
		// 	// 期望关联设备响应
		// 	id: String,
		// 	value: Mixed,
		// },
		notice: true, // 是否通知
	})
		.save()
		.then(docs => {
			console.log(docs);
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// put
// 更新设备参数
const updateDevice = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: update_device_unknown_error',
			`系统未知错误`
		);
	}

	await Device.findOne({
		deviceId: reqData.deviceId,
	}).then(docs => {
		if (docs === null) {
			throw new APIError(
				'device: update_device_failed',
				'设备不存在，请重试'
			);
		}
	});

	const docs = await Device.findOneAndUpdate(
		{
			deviceId: reqData.deviceId,
		},
		reqData.data,
		{
			new: true,
		}
	).catch(error => {
		console.log(error.message);
		throw new APIError('device: update_device_failed', '更新失败');
	});

	if (docs.deviceId) {
		const resData = {
			groupId: docs.groupId,
			roomId: docs.roomId,
			deviceId: docs.deviceId,
			categoryItemName: reqData.categoryItemName,
			categoryItemId: docs.categoryItemId,
			name: docs.name,
			desc: docs.desc,
			os: docs.os,
			networking: docs.networking,
			protocol: docs.protocol,
		};
		io.to(docs.groupId).emit('updateDevices', {
			type: 'update',
			data: resData,
		});
		ctx.rest({
			ok: true,
		});
	} else {
		throw new APIError(
			'device: update_device_failed',
			'设备不存在，请重试'
		);
	}
};

// 取消定时
const canclDeviceTimedTask = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: cancl_device_timed_task_unknown_error',
			'系统未知错误'
		);
	}

	await Promise.all([
		DeviceTimedTask.updateOne(
			{
				timedTaskId: reqData.timedTaskId,
			},
			{
				perform: false,
			}
		),
		schedule.canclTimedTask(reqData.timedTaskId),
	])
		.then(docs => {
			if (docs[1]) {
				ctx.rest({
					ok: true,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError(
				'device: cancl_device_timed_task_failed',
				'取消定时失败'
			);
		});
};

// 开始定时
const startDeviceTimedTask = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: start_device_timed_task_unknown_error',
			`系统未知错误`
		);
	}

	const docs = await DeviceTimedTask.findOne({
		timedTaskId: reqData.timedTaskId,
	}).catch(error => {
		console.log(error.message);
		throw new APIError('device: database_error', '系统未知错误');
	});

	if (docs === null) {
		throw new APIError(
			'device: start_device_timed_task_failed',
			`定时任务不存在，请重试`
		);
	}

	try {
		const executeTime = await schedule.startTimedTask(docs);
		await DeviceTimedTask.updateOne(
			{
				timedTaskId: reqData.timedTaskId,
			},
			{
				perform: true,
				executeTime: executeTime,
			}
		).then(() => {
			ctx.rest({
				executeTime: executeTime,
			});
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError(
			'device: start_device_timed_task_failed',
			'开始定时失败'
		);
	}
};

// 重置定时任务
const updateDeviceTimedTask = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'device: update_device_timed_task_unknown_error',
			`系统未知错误`
		);
	}

	const canclTask = schedule.canclTimedTask(reqData.timedTaskId);
	if (!canclTask) {
		throw new APIError('device: database_error', '系统未知错误');
	}

	const executeTime = schedule.startTimedTask({
		name: reqData.name,
		userId: payload.userId,
		groupId: payload.groupId,
		deviceId: reqData.deviceId,
		timedTaskId: reqData.timedTaskId,
		time: reqData.time,
		desired: reqData.desired,
	});
	await DeviceTimedTask.updateOne(
		{
			timedTaskId: reqData.timedTaskId,
		},
		{
			timedTaskId: reqData.timedTaskId,
			name: reqData.name,
			time: reqData.time,
			executeTime: executeTime,
			desired: reqData.desired,
			perform: true,
			finish: false,
		}
	)
		.then(docs => {
			if (docs.ok) {
				ctx.rest({
					executeTime: executeTime,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError(
				'device: update_device_timed_task_unknown_error',
				'系统未知错误'
			);
		});
};

// 更新关联设备
const updateDeviceAssociate = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'device: update_device_associate_unknown_error',
			`系统未知错误`
		);
	}

	let data = {};
	// 1 触发条件; 2 期望响应
	if (reqData.type === 1) {
		data = {
			deviceId: reqData.deviceId, // 设备 ID
			condition: {
				// 关联设备触发条件
				id: reqData.condition.id,
				value: reqData.condition.value,
			},
		};
	} else if (reqData.type === 2) {
		data = {
			associatedDeviceId: reqData.associatedDeviceId, // 关联设备 ID
			expect: {
				// 期望关联设备响应
				id: reqData.expect.id,
				value: reqData.expect.value,
			},
		};
	}
	await DeviceAssociate.updateOne(
		{
			associateId: reqData.associateId,
			groupId: payload.groupId,
		},
		data
	)
		.then(docs => {
			console.log(docs);
			ctx.rest({ ok: true });
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError(
				'device: update_device_associate_unknown_error',
				'系统未知错误'
			);
		});
};

// delete
// 删除设备
const deleteDevice = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.query,
		getJWTPayload(ctx.headers.authorization),
	];

	if (!reqData) {
		throw new APIError(
			'device: delete_device_unknown_error',
			`系统未知错误`
		);
	}

	await Device.findOne({
		deviceId: reqData.deviceId,
	}).then(docs => {
		if (docs === null) {
			throw new APIError(
				'device: delete_device_failed',
				'设备不存在，请重试'
			);
		}
	});

	try {
		const timedTasks = await DeviceTimedTask.find({
			deviceId: reqData.deviceId,
		});

		await Promise.all([
			Device.deleteOne({
				groupId: payload.groupId,
				deviceId: reqData.deviceId,
			}),
			DeviceStatus.deleteOne({
				deviceId: reqData.deviceId,
			}),
			DeviceTimedTask.deleteMany({
				deviceId: reqData.deviceId,
			}),
			DeviceLog.deleteMany({ deviceId: reqData.deviceId }),
		]);
		timedTasks.forEach(el => {
			schedule.canclTimedTask(el.timedTaskId);
		});

		io.to(payload.groupId).emit('updateDevices', {
			type: 'delete',
			deviceId: reqData.deviceId,
		});
		ctx.rest({ ok: true });
	} catch (error) {
		console.log(error.message);
		throw new APIError('device: delete_device_failed', '删除失败');
	}
};

// 删除日志
const deleteDeviceLog = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_log_unknown_error',
			`系统未知错误`
		);
	}

	await DeviceLog.deleteMany({ deviceId: reqData.deviceId })
		.then(docs => {
			if (docs.ok) {
				ctx.rest({ ok: true });
			} else {
				ctx.rest({ ok: false });
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 删除定时任务
const deleteDeviceTimedTask = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: delete_device_timed_task_unknown_error',
			`系统未知错误`
		);
	}

	await Promise.all([
		DeviceTimedTask.deleteOne({ timedTaskId: reqData.timedTaskId }),
		schedule.canclTimedTask(reqData.timedTaskId),
	])
		.then(docs => {
			if (docs[0].ok && docs[1]) {
				ctx.rest({ ok: true });
			} else {
				ctx.rest({ ok: false });
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('device: database_error', `系统未知错误`);
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
			console.log(error.message);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备信息
const getDeviceInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: get_all_device_info_unknown_error',
			`系统未知错误`
		);
	}

	await Device.aggregate([
		{
			$match: { deviceId: reqData.deviceId },
		},
		{
			$lookup: {
				from: 'deviceCategoryItems',
				localField: 'categoryItemId',
				foreignField: 'categoryItemId',
				as: 'categoryItem',
			},
		},
		{
			$unwind: {
				path: '$categoryItem', // 拆分子数组
				preserveNullAndEmptyArrays: true, // 空的数组也拆分
			},
		},
	])
		.then(docs => {
			if (docs[0].deviceId) {
				ctx.rest({
					groupId: docs[0].groupId,
					deviceId: docs[0].deviceId,
					name: docs[0].name,
					roomId: docs[0].roomId,
					categoryItemName: docs[0].categoryItem.name,
					desc: docs[0].desc,
					networking: docs[0].networking,
					os: docs[0].os,
					protocol: docs[0].protocol,
				});
			} else {
				ctx.rest({ ok: false });
			}
		})
		.catch(error => {
			console.log(error.message);
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
			console.log(error.message);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备属性
const getDeviceAttrById = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: get_dpeviceParam_and_attr_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await DeviceAttr.findOne({
		categoryItemId: reqData.categoryItemId,
	})
		.then(docs => {
			ctx.rest(docs.attr);
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 获取设备日志
const getDeviceLogById = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}
	let docs = await getLogs(reqData).catch(error => {
		console.log(error.message);
		throw new APIError('device: database_error', `系统未知错误`);
	});

	if (!docs.length && Number(reqData.dayNum) === 0) {
		docs = await DeviceLog.find({
			deviceId: reqData.deviceId,
		})
			.sort({ _id: -1 })
			.limit(5)
			.catch(error => {
				console.log(error.message);
				throw new APIError('device: database_error', `系统未知错误`);
			});
	}
	ctx.rest(docs);
};

// 获取设备定时任务
const getDeviceTimedTask = async (ctx, next) => {
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.query,
	];
	if (!reqData) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}
	await DeviceTimedTask.find({
		deviceId: reqData.deviceId,
		userId: payload.userId,
		scenarioMode: false,
	})
		.then(docs => {
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError(
				'device: get_device_timed_task_by_id_unknown_error',
				`系统未知错误`
			);
		});
};

// 获取定时任务
const getDeviceTimedTaskById = async (ctx, next) => {
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.query,
	];
	if (!reqData) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}
	await DeviceTimedTask.findOne({
		timedTaskId: reqData.timedTaskId,
		userId: payload.userId,
		scenarioMode: false,
	})
		.then(docs => {
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError(
				'device: get_device_timed_task_by_id_unknown_error',
				`系统未知错误`
			);
		});
};
// 获取设备关联
const getDeviceAssociate = async (ctx, next) => {
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.query,
	];
	if (!reqData) {
		throw new APIError(
			'device: get_device_associate_unknown_error',
			`系统未知错误`
		);
	}

	await DeviceAssociate.find({
		groupId: payload.groupId,
	})
		.then(docs => {
			console.log(docs);
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError(
				'device: get_device_timed_task_by_id_unknown_error',
				`系统未知错误`
			);
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

// 获取日志
const getLogs = reqData => {
	const date = new Date();
	const [start, end] = [
		new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate() - reqData.dayNum
		),
		new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
	];
	return DeviceLog.find({
		deviceId: reqData.deviceId,
		createTime: { $gte: start, $lt: end },
	}).sort({ _id: -1 });
};

module.exports = {
	// 添加设备
	'POST /api/device/setDevice': setDevice,
	// 操作设备
	'POST /api/device/setDesired': setDesired,
	// 设置定时任务
	'POST /api/device/setDeviceTimedTask': setDeviceTimedTask,
	// 设置关联设备
	'POST /api/device/deviceAssociate': setDeviceAssociate,

	// 更新设备参数
	'PUT /api/device/updateDevice': updateDevice,
	// 取消定时
	'PUT /api/device/canclDeviceTimedTask': canclDeviceTimedTask,
	// 开始定时
	'PUT /api/device/startDeviceTimedTask': startDeviceTimedTask,
	// 重置定时任务
	'PUT /api/device/updateDeviceTimedTask': updateDeviceTimedTask,
	// 更新关联设备
	'PUT /api/device/deviceAssociate': updateDeviceAssociate,

	// 删除设备
	'DELETE /api/device/deleteDevice': deleteDevice,
	// 删除日志
	'DELETE /api/device/deleteDeviceLog': deleteDeviceLog,
	// 删除定时任务
	'DELETE /api/device/deleteDeviceTimedTask': deleteDeviceTimedTask,

	// 获取设备参数与属性
	'GET /api/device/getDeviceParamAndAttrById': getDeviceParamAndAttrById,
	// 获取属性
	'GET /api/device/getDeviceAttrById': getDeviceAttrById,
	// 获取 groupId 下所有的设备信息
	'GET /api/device/getAllDeviceInfo': getAllDeviceInfo,
	// 获取设备信息
	'GET /api/device/getDeviceInfo': getDeviceInfo,
	// 获取设备日志
	'GET /api/device/getDeviceLogById': getDeviceLogById,
	// 获取定时任务
	'GET /api/device/getDeviceTimedTask': getDeviceTimedTask,
	// 获取定时任务
	'GET /api/device/getDeviceTimedTaskById': getDeviceTimedTaskById,
	// 获取设备 Id
	'GET /api/device/getDeviceId': getDeviceId,
	// 获取设备关联
	'GET /api/device/DeviceAssociate': getDeviceAssociate,
};
