const DeviceStatus = require('../models/DeviceStatus');
const DeviceAssociate = require('../models/DeviceAssociate');
const setOnlineLog = require('../utils/logKit').setOnlineLog;
const canclAllTimedTask = require('../utils/schedule').canclAllTimedTask;
const mqttClient = require('../middleware/mqttClient');
const setDesiredLog = require('../utils/logKit').setDesiredLog;
const uuid = require('uuid');

// 更新数据库
const updateStatus = async (deviceId, payload) => {
	if (!deviceId || !payload) {
		return;
	}
	let data = {};
	Object.keys(payload).forEach(el => {
		data[`status.${el}`] = payload[el];
	});

	await DeviceStatus.findOneAndUpdate(
		{ deviceId: deviceId },
		{ $set: data },
		{
			new: true,
		}
	)
		.then(docs => {
			if (!docs.groupId) {
				return;
			}
			io.to(docs.groupId).emit('updateDeviceStatus', {
				deviceId: deviceId,
				status: docs.status,
			});
		})
		.catch(error => {
			console.log(error);
		});
};

// 设置在线/离线状态
const setOnline = (deviceId, onLine) => {
	return DeviceStatus.findOneAndUpdate(
		{ deviceId: deviceId },
		{ onLine: onLine },
		{ new: true }
	)
		.then(docs => {
			let logType = 'info';
			if (!onLine) {
				logType = 'warn';
				canclAllTimedTask(deviceId);
			}
			setOnlineLog({
				groupId: docs.groupId,
				deviceId: deviceId,
				source: 'Device',
				logType: logType,
				onLine: onLine,
			});
			if (!docs.groupId) {
				return;
			}
			io.to(docs.groupId).emit('updateOnline', {
				deviceId: deviceId,
				onLine: onLine,
			});
		})
		.catch(error => {
			console.log(`MQTT_database_error: ${error}`);
		});
};

// 关联设备响应
const setDeviceAssociate = async (deviceId, payload) => {
	if (!deviceId || !payload) {
		return;
	}

	const docs = await DeviceAssociate.find({
		'condition.deviceId': deviceId,
		open: true,
	}).catch(error => {
		console.log(error);
	});

	if (!docs.length) {
		return;
	}

	for (const el of docs) {
		if (!el.expect.deviceId) {
			continue;
		}
		if (el.condition.judge !== undefined) {
			if (el.condition.judge === 1) {
				if (payload[el.condition.id] <= el.condition.value) {
					continue;
				}
			} else if (el.condition.judge === 2) {
				if (payload[el.condition.id] >= el.condition.value) {
					continue;
				}
			} else if (el.condition.judge === 3) {
				if (payload[el.condition.id] !== el.condition.value) {
					continue;
				}
			}
		} else if (payload[el.condition.id] !== el.condition.value) {
			continue;
		}

		const data = await DeviceStatus.findOne({
			deviceId: el.expect.deviceId,
		});
		if (data.onLine) {
			const desiredId = uuid.v1();
			let desired = {};
			desired[el.expect.id] = el.expect.value;
			await Promise.all([
				mqttClient.MQTTPublish(el.groupId, el.expect.deviceId, desired),
				setDesiredLog({
					logId: desiredId,
					groupId: el.groupId,
					deviceId: el.expect.deviceId,
					source: 'DeviceAssociate',
					logType: 'info',
					desired: desired,
				}),
			]);
		}
	}
};

module.exports = {
	// 更新 status
	updateStatus: updateStatus,

	// 设置在线状态
	setOnline: setOnline,

	setDeviceAssociate: setDeviceAssociate,
};
