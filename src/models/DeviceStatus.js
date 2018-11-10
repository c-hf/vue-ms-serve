const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const DeviceStatusSchema = new Schema(
	{
		DeviceId: String,
		onLine: Boolean,
		attr: [
			{
				id: String,
				name: String,
				type: String,
				value: String,
				unit: String,
			},
		],
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
