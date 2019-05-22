const schedule = require('node-schedule');
const Mode = require('../models/Mode');
// const ModeTask = require('../models/ModeTask');

const setDesiredLog = require('./logKit').setDesiredLog;
const mqttClient = require('../middleware/mqttClient');
const uuid = require('uuid');
const ModeMap = new Map();
const ModeTaskMap = new Map();

// 情景模式任务
const timedTask = (data, modeTasks) => {
	const currentDate = new Date();
	let [modes, time] = [
		[],
		{
			minute: 0,
			second: 0,
		},
	];

	modeTasks.forEach((el, index) => {
		time.minute = time.minute + el.time.minute;
		time.second = time.second + el.time.second;

		const date = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			currentDate.getHours(),
			currentDate.getMinutes(),
			currentDate.getSeconds() + time.minute * 60 + time.second
		);
		const mode = schedule.scheduleJob(date, async () => {
			mqttClient.MQTTPublish(data.groupId, el.deviceId, el.desired);
			const desiredId = uuid.v1();
			setDesiredLog({
				logId: desiredId,
				groupId: data.groupId,
				deviceId: el.deviceId,
				source: 'Mode',
				logType: 'info',
				desired: el.desired,
			});

			// 所有任务完成后删除 Map 中任务
			if (index === modeTasks.length - 1) {
				ModeTaskMap.delete(data.modeId);
				// 情景模式执行完毕
				await Mode.updateOne(
					{
						modeId: data.modeId,
					},
					{
						perform: false, // 执行完毕
					}
				);
				io.to(data.groupId).emit('updateMode', {
					type: 'perform',
					modeId: data.modeId,
					data: {
						perform: false,
					},
					title: data.name,
					message: `情景模式执行完毕!`,
				});
			}
		});
		modes.push(mode);
	});

	if (ModeTaskMap.has(data.modeId)) {
		ModeTaskMap.delete(data.modeId);
	}
	if (modes.length) {
		ModeTaskMap.set(data.modeId, modes);
	}
};

// 开始情景模式
const startMode = async data => {
	try {
		// console.log('开启');
		if (data.timeType === 0) {
			const docs = await Mode.aggregate([
				{
					$match: { modeId: data.modeId },
				},
				{
					$lookup: {
						from: 'modeTasks',
						localField: 'content.taskId',
						foreignField: 'taskId',
						as: 'modeTasks',
					},
				},
			]);
			// 情景模式改为执行状态
			await Mode.updateOne(
				{
					modeId: data.modeId,
				},
				{
					perform: true, // 执行中
					switch: false,
				}
			);
			io.to(data.groupId).emit('updateMode', {
				type: 'perform',
				modeId: data.modeId,
				data: {
					perform: true,
					switch: false,
				},
				title: data.name,
				message: `情景模式开始执行!`,
			});
			timedTask(data, docs[0].modeTasks);
		} else if (data.timeType === 1) {
			const currentDate = new Date();
			const modeDate = new Date(data.time);
			if (currentDate > modeDate) {
				return false;
			}

			const mode = schedule.scheduleJob(modeDate, async () => {
				const docs = await Mode.aggregate([
					{
						$match: { modeId: data.modeId },
					},
					{
						$lookup: {
							from: 'modeTasks',
							localField: 'content.taskId',
							foreignField: 'taskId',
							as: 'modeTasks',
						},
					},
				]);
				// 情景模式改为执行状态
				await Mode.updateOne(
					{
						modeId: data.modeId,
					},
					{
						perform: true, // 执行中
					}
				);
				io.to(data.groupId).emit('updateMode', {
					type: 'perform',
					modeId: data.modeId,
					data: {
						perform: true,
					},
					title: data.name,
					message: `情景模式开始执行!`,
				});
				timedTask(data, docs[0].modeTasks);
				ModeMap.delete(data.modeId);
			});
			if (ModeMap.has(data.modeId)) {
				ModeMap.delete(data.modeId);
			}
			ModeMap.set(data.modeId, [mode]);
		} else if (data.timeType === 2) {
			const modeDate = new Date(data.time);
			// console.log(data.date);
			let modes = [];
			data.date.forEach((el, index) => {
				const mode = schedule.scheduleJob(
					`${modeDate.getSeconds()} ${modeDate.getMinutes()} ${modeDate.getHours()} * * ${el}`,
					async () => {
						const docs = await Mode.aggregate([
							{
								$match: { modeId: data.modeId },
							},
							{
								$lookup: {
									from: 'modeTasks',
									localField: 'content.taskId',
									foreignField: 'taskId',
									as: 'modeTasks',
								},
							},
						]);
						// 情景模式改为执行状态
						await Mode.updateOne(
							{
								modeId: data.modeId,
							},
							{
								perform: true, // 执行中
							}
						);
						io.to(data.groupId).emit('updateMode', {
							type: 'perform',
							modeId: data.modeId,
							data: {
								perform: true,
							},
							title: data.name,
							message: `情景模式开始执行!`,
						});
						timedTask(data, docs[0].modeTasks);
					}
				);
				modes.push(mode);
			});

			if (ModeMap.has(data.modeId)) {
				ModeMap.delete(data.modeId);
			}
			ModeMap.set(data.modeId, modes);
			// 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
		}
	} catch (error) {
		console.log('setTimedTask: ', error.message);
	}
};

// 取消定时
const canclMode = modeId => {
	const modes = ModeMap.get(modeId);
	const tasks = ModeTaskMap.get(modeId);
	// console.log('取消');
	// console.log(modes, tasks);
	// 取消模式任务定时并删除
	if (tasks !== undefined) {
		tasks.forEach(el => {
			el.cancel();
		});
		ModeTaskMap.delete(modeId);
	}
	// 取消模式定时并删除
	if (modes !== undefined) {
		modes.forEach(el => {
			el.cancel();
		});
		ModeMap.delete(modeId);
	}
};

module.exports = {
	startMode: startMode,
	canclMode: canclMode,
};
