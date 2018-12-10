const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const userInfoSchema = new Schema({
	userId: String,
	groupId: String,
	nickName: String,
	avatar: {
		type: String,
	},
	intro: {
		type: String,
		min: 1,
		max: 64,
	},
	sex: {
		type: String,
	},
	birthday: String,
});

// 建立模型
const UserInfo = mongoose.model('UserInfo', userInfoSchema, 'usersInfo');

// 用户信息表
module.exports = UserInfo;
