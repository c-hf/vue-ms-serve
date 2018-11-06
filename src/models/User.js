const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const userSchema = new Schema({
	id: String,
	email: String,
	phone: String,
	password: String,
});

// 建立模型
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
