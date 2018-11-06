const mongoose = require('../middleware/db');
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
	'VerificationCodes'
);

module.exports = VerificationCode;
