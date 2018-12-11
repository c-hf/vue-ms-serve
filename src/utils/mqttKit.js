const Device = require('../models/Device');
const DeviceStatus = require('../models/DeviceStatus');

// 更新数据库
const updateStatus = async (deviceId, payload) => {
	if (!deviceId || !payload) {
		return;
	}
	await Promise.all([
		payload.forEach(el => {
			DeviceStatus.updateOne(
				{ deviceId: deviceId, 'status.id': el.id },
				{
					$set: {
						'status.$.value': el.value,
					},
				}
			).catch(error => {
				console.log(`MQTT_database_error: ${error}`);
			});
		}),
		Device.findOne({ deviceId: deviceId }),
	]).then(docs => {
		io.to(docs[1].groupId).emit('updateDeviceStatus', {
			deviceId: deviceId,
			status: payload,
		});
	});
};

const setOnline = (deviceId, onLine) => {
	return Promise.all([
		DeviceStatus.updateOne({ deviceId: deviceId }, { onLine: onLine }),
		Device.findOne({ deviceId: deviceId }),
	])
		.then(docs => {
			if (!docs[1]) {
				return;
			}
			io.to(docs[1].groupId).emit('updateOnline', {
				deviceId: deviceId,
				onLine: onLine,
			});
		})
		.catch(error => {
			console.log(`MQTT_database_error: ${error}`);
		});
};

module.exports = {
	updateStatus: updateStatus,
	setOnline: setOnline,
};
