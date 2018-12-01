const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const userRoleSchema = new Schema({
	userId: String,
	roelId: {
		type: String,
		default: 'admin',
	},
	roleName: {
		type: String,
		default: '管理员',
	},
});

// 建立模型
const UserRole = mongoose.model('UserRole', userRoleSchema, 'userRoles');

// 用户表
module.exports = UserRole;
