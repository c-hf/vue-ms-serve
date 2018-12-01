const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const UserGroup = require('../models/UserGroup');

const APIError = require('../middleware/rest').APIError;
const jsonWebToken = require('../utils/jsonWebToken');
const getId = require('../utils/getId');

// 创建 group
const setGroup = async (ctx, next) => {
	const [payload, reqData] = [
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
		ctx.request.body,
	];
	if (!reqData || !payload) {
		throw new APIError('group: set_group_unknown_error', `系统未知错误`);
	}
	// 获取组ID
	const groupId = getId(10);

	await Promise.all([
		new UserGroup({
			groupId: groupId,
			ownerId: payload.userId,
			groupName: reqData.groupName,
			intro: '',
			region: reqData.region,
			member: [
				{
					userId: payload.userId,
				},
			],
		}).save(),
		UserInfo.updateOne({ userId: payload.userId }, { groupId: groupId }),
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 添加 group 成员
const addGroupMember = async (ctx, next) => {
	const [payload, reqData] = [
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
		ctx.request.body,
	];
	if (!reqData) {
		throw new APIError(
			'device: add_group_member_unknown_error',
			`系统未知错误`
		);
	}
	await UserInfo.findOne({ userId: reqData.userId }).then(docs => {
		if (!docs.userId) {
		}
		if (!docs.groupId) {
			throw new APIError('group: add_group_member_unknown_error', `用户`);
		}
	});
	await Promise.all([
		UserGroup.updateOne(
			{
				groupId: reqData.groupId,
			},
			{
				$push: {
					member: { userId: reqData.userId },
				},
			}
		),
		UserInfo.updateOne(
			{ userId: reqData.userId },
			{ groupId: reqData.groupId }
		),
	])
		.then(docs => {
			console.log(docs);
			ctx.rest('ok');
		})
		.catch(error => {
			console.log(error);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// delete
// 删除 group 成员
const deleteGroupMember = async (ctx, next) => {};

// 获取 group
const getGroupById = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('group: get_group_unknown_error', `系统未知错误`);
	}
	await UserGroup.aggregate([
		{
			$lookup: {
				from: 'usersInfo',
				localField: 'member.userId',
				foreignField: 'userId',
				as: 'memberList',
			},
		},
		{
			$project: {
				member: 0,
			},
		},
		{
			$match: { groupId: reqData.groupId },
		},
	])
		.then(docs => {
			// console.log(docs);
			ctx.rest(docs);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

module.exports = {
	// 创建 group
	'POST /api/user/setGroup': setGroup,
	// 添加 group 成员
	'POST /api/user/addGroupMember': addGroupMember,

	// 删除 group 成员
	'DELETE /api/user/deleteGroupMember': deleteGroupMember,

	// 获取 group
	'GET /api/user/getGroupById': getGroupById,
};
