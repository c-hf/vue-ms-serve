const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const LightSchema = new Schema(
	{
		// id: String, // 用户 Id
		// categoryItemId: String, // 设备类型 Id
		DeviceId: String,
		attr: [
			{
				id: String,
				value: String,
			},
		],
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
const Light = mongoose.model('Light', LightSchema, 'lights');

// 照明设备
module.exports = Light;
