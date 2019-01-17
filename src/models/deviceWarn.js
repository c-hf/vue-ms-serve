const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceWarnSchema = new Schema(
	{
		deviceId: String,
		groupId: String,
		reported: Object,
		message: String,
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
const deviceWarn = mongoose.model(
	'deviceWarn',
	deviceWarnSchema,
	'deviceWarns'
);

// 设备参数
module.exports = deviceWarn;
