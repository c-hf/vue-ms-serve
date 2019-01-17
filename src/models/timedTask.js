const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const timedTaskSchema = new Schema({
	taskId: String,
	groupId: String,
	time: String,
	taskList: Object,
});

// 建立模型
const timedTask = mongoose.model('timedTask', timedTaskSchema, 'timedTasks');

// 设备参数
module.exports = timedTask;
