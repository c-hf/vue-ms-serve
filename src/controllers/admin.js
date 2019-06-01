const Device = require('../models/Device');
const UserGroup = require('../models/UserGroup');
const UserInfo = require('../models/UserInfo');
const DeviceStatus = require('../models/DeviceStatus');
const getJWTPayload = require('../utils/jsonWebToken').getJWTPayload;
const APIError = require('../middleware/rest').APIError;

// 设备
const getDevices = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await Device.find()
		.then(docs => {
			if (!docs) {
				ctx.rest({ ok: false });
			} else {
				ctx.rest(docs);
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 家庭组
const getGroup = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await UserGroup.find()
		.then(docs => {
			if (!docs) {
				ctx.rest({ ok: false });
			} else {
				ctx.rest(docs);
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 用户
const getUser = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await UserInfo.find()
		.then(docs => {
			if (!docs) {
				ctx.rest({ ok: false });
			} else {
				ctx.rest(docs);
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 设备数量
const getDevicesNum = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await Device.find()
		.then(docs => {
			if (!docs) {
				ctx.rest({ total: 0 });
			} else {
				ctx.rest({ total: docs.length });
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 家庭组数量
const getGroupNum = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await UserGroup.find()
		.then(docs => {
			if (!docs) {
				ctx.rest({ total: 0 });
			} else {
				ctx.rest({ total: docs.length });
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 用户数量
const getUserNum = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await UserInfo.find()
		.then(docs => {
			if (!docs) {
				ctx.rest({ total: 0 });
			} else {
				ctx.rest({ total: docs.length });
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

// 设备状态
const getDevicesStatusNum = async (ctx, next) => {
	const [payload] = [getJWTPayload(ctx.headers.authorization)];
	if (!payload) {
		throw new APIError(
			'device: get_device_log_by_id_unknown_error',
			`系统未知错误`
		);
	}

	await Promise.all([
		DeviceStatus.find({ onLine: true }),
		DeviceStatus.find({ onLine: false }),
	])
		.then(docs => {
			if (!docs) {
				ctx.rest({ onLineDeviceNum: 0, lineDeviceNum: 0 });
			} else {
				ctx.rest({
					onLineDeviceNum: docs[0].length,
					lineDeviceNum: docs[1].length,
				});
			}
		})
		.catch(error => {
			throw new APIError('device: database_error', `系统未知错误`);
		});
};

module.exports = {
	// 设备
	'GET /api/admin/device': getDevices,
	// 家庭组
	'GET /api/admin/group': getGroup,
	// 用户
	'GET /api/admin/user': getUser,

	// 设备数量
	'GET /api/admin/device/num': getDevicesNum,
	// 家庭组数量
	'GET /api/admin/group/num': getGroupNum,
	// 用户数量
	'GET /api/admin/user/num': getUserNum,
	// 设备状态
	'GET /api/admin/device/status/num': getDevicesStatusNum,
};
