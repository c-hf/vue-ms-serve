const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const userGroupSchema = new Schema(
	{
		groupId: String, // 分组 Id
		groupName: String, // 分组名
		ownerId: String, // 拥有者 Id
		// 所在地
		region: [Object],
		// 成员
		member: [Object],
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
const UserGroup = mongoose.model('UserGroup', userGroupSchema, 'userGroups');

// 用户关系表
module.exports = UserGroup;
