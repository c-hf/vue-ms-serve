const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const codeSchema = new Schema({
	id: String,
	code: String,
	date: Number,
	validTime: Number,
});

// 建立模型
const VerificationCode = mongoose.model(
	'VerificationCode',
	codeSchema,
	'verificationCodes'
);

// 验证码表
module.exports = VerificationCode;
