const DeviceStatus = require('../models/DeviceStatus');
const setOnlineLog = require('../utils/logKit').setOnlineLog;

// 更新数据库
const updateStatus = async (deviceId, payload) => {
	if (!deviceId || !payload) {
		return;
	}
	let data = {};
	Object.keys(payload).forEach(el => {
		data[`status.${el}`] = payload[el];
	});

	DeviceStatus.findOneAndUpdate(
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

module.exports = {
	// 更新 status
	updateStatus: updateStatus,

	// 设置在线状态
	setOnline: setOnline,
};
