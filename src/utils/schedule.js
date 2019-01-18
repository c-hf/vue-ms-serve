const schedule = require('node-schedule');
const DeviceTimedTask = require('../models/DeviceTimedTask');

const mqttClient = require('../middleware/mqttClient');
const schedulesMap = new Map();

// let task = schedule.scheduleJob('42 * * * *', () => {
// 	console.log('The answer to life, the universe, and everything!');
// });

const setTimedTask = data => {
	const currentDate = new Date();
	const date = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		currentDate.getDate(),
		currentDate.getHours() + data.time.hour,
		currentDate.getMinutes(),
		currentDate.getSeconds() + data.time.minute * 60
	);
	try {
		const dbData = {
			timedTaskId: data.timedTaskId,
			groupId: data.groupId,
			deviceId: data.deviceId,
			userId: data.userId,
			time: data.time,
			desired: data.desired,
			perform: true,
			finish: false,
		};
		new DeviceTimedTask(dbData).save();

		const timedTask = schedule.scheduleJob(date, () => {
			mqttClient.MQTTPublish(data.groupId, data.deviceId, data.desired);
			schedulesMap.delete(data.timedTaskId);
			DeviceTimedTask.updateOne(
				{ timedTaskId: data.timedTaskId },
				{
					finish: true,
				}
			);
		});

		schedulesMap.set(data.timedTaskId, timedTask);
		io.to(data.groupId).emit(
			`${data.deviceId}-updateDeviceTimedTask`,
			dbData
		);
	} catch (error) {
		console.log('setTimedTask: ', error.message);
	}
};

module.exports = {
	schedules: schedulesMap,
	setTimedTask: setTimedTask,
};
