const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const userSchema = new Schema(
	{
		id: String,
		email: String,
		phone: String,
		password: String,
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
const User = mongoose.model('User', userSchema, 'users');

// 用户表
module.exports = User;
