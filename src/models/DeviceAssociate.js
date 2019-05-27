const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceAssociateSchema = new Schema({
	associateId: String, // 关联 ID
	groupId: String, // 群组 ID
	name: String,
	condition: {
		// 关联设备触发条件
		deviceId: String, // 设备 ID
		id: String,
		judge: Number,
		value: Schema.Types.Mixed,
	},
	expect: {
		// 期望关联设备响应
		deviceId: String, // 设备 ID
		id: String,
		value: Schema.Types.Mixed,
	},
	notice: Boolean, // 是否通知
	open: Boolean, // 开启设备关联
});

// 建立模型
const DeviceAssociate = mongoose.model(
	'DeviceAssociate',
	deviceAssociateSchema,
	'deviceAssociates'
);

// 设备参数
module.exports = DeviceAssociate;
