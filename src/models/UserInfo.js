const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const userInfoSchema = new Schema({
	userId: String,
	groupId: String,
	nickName: String,
	avatar: {
		type: String,
		default: 'http://localhost:3000/static/avatar/0.jpg',
	},
	intro: String,
	sex: {
		type: String,
		default: '男',
	},
	birthday: String,
	region: String,
});

// 建立模型
const UserInfo = mongoose.model('UserInfo', userInfoSchema, 'usersInfo');

// 用户信息表
module.exports = UserInfo;
