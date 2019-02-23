const DeviceLog = require('../models/DeviceLog');
const logKeyWord = require('../config/index').logKeyWord;

const setLog = data => {
	new DeviceLog({
		groupId: data.groupId,
		deviceId: data.deviceId,
		source: data.source,
		logType: data.logType,
		message: data.message,
		errorMessage: '',
	})
		.save()
		.then(docs => {
			io.to(docs.groupId).emit(`${docs.deviceId}-updateDeviceLog`, {
				groupId: docs.groupId,
				deviceId: docs.deviceId,
				source: docs.source,
				logType: docs.logType,
				message: docs.message,
				createTime: docs.createTime,
			});
		})
		.catch(error => {
			console.log('setdeviceLog：', error);
		});
};

module.exports = {
	// 添加操作日志
	setDesiredLog: data => {
		data.message = '';
		Object.keys(data.desired).forEach(key => {
			if (logKeyWord[key]) {
				data.message = `${data.message} ${logKeyWord[key]}${
					logKeyWord[data.desired[key]]
				}`;
			}
		});

		setLog(data);
	},

	// 添加在线 / 离线日志
	setOnlineLog: data => {
		data.onLine ? (data.message = '设备上线') : (data.message = '设备离线');
		setLog(data);
	},
};
