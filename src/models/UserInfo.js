const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const userInfoSchema = new Schema({
	id: String,
	nickName: String,
	avatar: {
		type: String,
		default: 'http://localhost:3000/static/avatar/0.jpg',
	},
	intro: String,
	sex: String,
	birthday: String,
	region: String,
});

// 建立模型
const UserInfo = mongoose.model('UserInfo', userInfoSchema, 'usersInfo');

module.exports = UserInfo;
