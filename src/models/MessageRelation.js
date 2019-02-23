const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const messageRelationSchema = new Schema({
	messageId: String,
	userId: String,
	status: String, // 已读/未读
});

// 建立模型
const MessageRelation = mongoose.model(
	'MessageRelation',
	messageRelationSchema,
	'messageRelations'
);

// 设备参数
module.exports = MessageRelation;
