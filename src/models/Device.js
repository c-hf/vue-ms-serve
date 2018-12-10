const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const DeviceSchema = new Schema(
	{
		groupId: String, // 分组 Id
		roomId: String, // 所在房间 Id
		deviceId: String, // 设备 Id
		categoryItemId: String, // 设备类型 Id
		name: String,
		desc: String,
		os: String,
		networking: String,
		protocol: String,
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
const Device = mongoose.model('Device', DeviceSchema, 'devices');

// 设备
module.exports = Device;
