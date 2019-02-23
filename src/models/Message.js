const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const messageSchema = new Schema(
	{
		messageId: String,
		category: String, // 分类（公共信息，群信息，设备消息）
		type: String, // 类型
		title: String,
		content: String, // 内容
		sender: String, // 发布者
		operation: Object, // 操作
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
const Message = mongoose.model('Message', messageSchema, 'messages');

// 设备参数
module.exports = Message;
