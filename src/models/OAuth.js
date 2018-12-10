const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const OAuthSchema = new Schema({
	userId: String,
	oauthName: String,
	oauthId: String,
});

// 建立模型
const OAuth = mongoose.model('OAuth', OAuthSchema, 'OAuth');

// 用户信息表
module.exports = OAuth;
