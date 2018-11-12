const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const userRoleSchema = new Schema({
	id: String,
	roelId: {
		type: String,
		default: 'user',
	},
	roleName: {
		type: String,
		default: '用户',
	},
});

// 建立模型
const UserRole = mongoose.model('UserRole', userRoleSchema, 'userRoles');

// 用户表
module.exports = UserRole;
