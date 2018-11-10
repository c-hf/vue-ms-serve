const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const DeviceSchema = new Schema(
	{
		id: String, // 用户 Id
		categoryItemId: String, // 设备类型 Id
		DeviceId: String, // 设备 Id
		name: String,
		describe: String,
		os: String,
		networking: String,
		protocol: String,
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
const Device = mongoose.model('Device', DeviceSchema, 'devices');

// 设备
module.exports = Device;
