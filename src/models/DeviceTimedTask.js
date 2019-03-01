const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const DeviceTimedTaskSchema = new Schema(
	{
		timedTaskId: String, // 任务ID
		name: String, // 任务名称
		groupId: String,
		userId: String,
		deviceId: String,
		time: Object, // 定时时间
		executeTime: Number, // 执行时间
		desired: Object, // 任务内容
		perform: Boolean, // 是否执行
		finish: Boolean, // 是否完成
		scenarioMode: {
			type: Boolean,
			default: false,
		}, // 是否情景模式
		createTime: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: { createdAt: 'createTime' },
	}
);

// 建立模型
const deviceTimedTask = mongoose.model(
	'deviceTimedTask',
	DeviceTimedTaskSchema,
	'deviceTimedTasks'
);

// 设备参数
module.exports = deviceTimedTask;
