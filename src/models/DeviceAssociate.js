const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceAssociateSchema = new Schema({
	associateId: String, // 关联 ID
	groupId: String, // 群组 ID
	deviceId: String, // 设备 ID
	condition: {
		// 关联设备触发条件
		id: String,
		value: Schema.Types.Mixed,
	},
	associatedDeviceId: String, // 关联设备 ID
	expect: {
		// 期望关联设备响应
		id: String,
		value: Schema.Types.Mixed,
	},
	notice: Boolean, // 是否通知
});

// 建立模型
const DeviceAssociate = mongoose.model(
	'DeviceAssociate',
	deviceAssociateSchema,
	'deviceAssociates'
);

// 设备参数
module.exports = DeviceAssociate;
