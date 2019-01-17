const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const DeviceStatusSchema = new Schema(
	{
		groupId: String,
		deviceId: String,
		onLine: Boolean,
		status: Object,
		createTime: {
			type: Date,
			default: Date.now,
		},
		updateTime: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
	}
);

// 建立模型
const DeviceStatus = mongoose.model(
	'DeviceStatus',
	DeviceStatusSchema,
	'deviceStatus'
);

// 照明设备
module.exports = DeviceStatus;
