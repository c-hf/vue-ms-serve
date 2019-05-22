const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const ModeTaskSchema = new Schema({
	taskId: String,
	deviceId: String,
	desired: Object,
	time: Object, // 定时时间
});

// 建立模型
const ModeTask = mongoose.model('ModeTask', ModeTaskSchema, 'modeTasks');

// 设备参数
module.exports = ModeTask;
