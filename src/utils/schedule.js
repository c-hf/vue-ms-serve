const schedule = require('node-schedule');
const DeviceTimedTask = require('../models/DeviceTimedTask');

const setDesiredLog = require('../utils/logKit').setDesiredLog;
const getId = require('../utils/getId');
const mqttClient = require('../middleware/mqttClient');
const schedulesMap = new Map();

// let task = schedule.scheduleJob('42 * * * *', () => {
// 	console.log('The answer to life, the universe, and everything!');
// });

// 定时任务
const timedTask = (date, data) => {
	const timedTask = schedule.scheduleJob(date, async () => {
		mqttClient.MQTTPublish(data.groupId, data.deviceId, data.desired);
		schedulesMap.delete(data.timedTaskId);
		await DeviceTimedTask.updateOne(
			{ timedTaskId: data.timedTaskId },
			{
				finish: true,
			}
		);
		io.to(data.groupId).emit(`${data.deviceId}-updateDeviceTimedTask`, {
			timedTaskId: data.timedTaskId,
			finish: true,
		});
		const desiredId = getId(15);
		setDesiredLog({
			logId: desiredId,
			groupId: data.groupId,
			deviceId: data.deviceId,
			source: 'Schedule',
			logType: 'info',
			desired: data.desired,
		});
	});
	if (schedulesMap.has(data.timedTaskId)) {
		schedulesMap.delete(timedTaskId);
	}
	schedulesMap.set(data.timedTaskId, timedTask);
};

// 设置定时任务
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
			name: data.name,
			groupId: data.groupId,
			deviceId: data.deviceId,
			userId: data.userId,
			time: data.time,
			executeTime: date.getTime(),
			desired: data.desired,
			perform: true,
			finish: false,
		};
		new DeviceTimedTask(dbData).save();

		timedTask(date, data);

		return dbData;
	} catch (error) {
		console.log('setTimedTask: ', error.message);
	}
};

// 取消定时
const canclTimedTask = timedTaskId => {
	const task = schedulesMap.get(timedTaskId);
	if (task === undefined) {
		return true;
	}
	task.cancel();
	if (schedulesMap.delete(timedTaskId)) {
		return true;
	} else {
		return false;
	}
};

// 开始定时
const startTimedTask = data => {
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
		timedTask(date, data);
		return date.getTime();
	} catch (error) {
		console.log('startTimedTask: ', error.message);
	}
};

// 取消设备全部定时
const canclAllTimedTask = async deviceId => {
	const docs = await DeviceTimedTask.find({
		deviceId: deviceId,
		perform: true,
		finish: false,
	});

	docs.forEach(el => {
		const task = schedulesMap.get(el.timedTaskId);
		if (task === undefined) {
			return;
		}
		task.cancel();
		schedulesMap.delete(el.timedTaskId);
	});
	await DeviceTimedTask.updateMany(
		{
			deviceId: deviceId,
			perform: true,
			finish: false,
		},
		{
			perform: false,
		}
	);
	return true;
};

module.exports = {
	schedules: schedulesMap,
	setTimedTask: setTimedTask,
	canclTimedTask: canclTimedTask,
	startTimedTask: startTimedTask,
	canclAllTimedTask: canclAllTimedTask,
};
