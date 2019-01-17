const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceLogSchema = new Schema(
	{
		logId: String,
		deviceId: String,
		groupId: String,
		source: String,
		logType: String,
		message: String,
		success: {
			type: Boolean,
			default: false,
		},
		errorMessage: String,
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
const DeviceLog = mongoose.model('DeviceLog', deviceLogSchema, 'deviceLogs');

// 设备参数
module.exports = DeviceLog;
