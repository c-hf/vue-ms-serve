const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const UserGroup = require('../models/UserGroup');
const Message = require('../models/Message');
const MessageRelation = require('../models/MessageRelation');

const APIError = require('../middleware/rest').APIError;
const jsonWebToken = require('../utils/jsonWebToken');
const getId = require('../utils/getId');

// 消息 ID
const getMessageId = () => {
	return (
		Math.random()
			.toString(36)
			.substr(2) + Date.now().toString()
	).substr(0, 20);
};

// 消息通知
const messageNotify = async (userId, message) => {
	const total = await MessageRelation.find({
		userId: userId,
		status: 'UNREAD',
	}).countDocuments();
	io.to(userId).emit('message', {
		message: message,
		total: total,
	});
};

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
			ctx.rest({
				ok: true,
			});
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 添加成员邀请
const addGroupMemberMsg = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'device: add_group_member_unknown_error',
			`系统未知错误`
		);
	}

	await UserInfo.findOne({ userId: reqData.userId }).then(docs => {
		if (!docs) {
			throw new APIError(
				'group: add_group_member_unknown_error',
				`用户不存在`
			);
		}
		if (docs.groupId) {
			throw new APIError(
				'group: add_group_member_unknown_error',
				`用户已加入其他群组`
			);
		}
	});

	const messageId = getMessageId();
	const [message, relation] = [
		{
			messageId: messageId,
			category: 'GROUP',
			type: 'INFO',
			title: '加入家庭组邀请',
			content: '邀请你加入家庭组',
			sender: 'system',
			operation: {
				groupType: 'Add',
				sourceId: payload.userId,
				userId: reqData.userId,
				groupId: reqData.groupId,
				operation: true,
				agree: false,
			},
		},
		{
			messageId: messageId,
			userId: reqData.userId,
			status: 'UNREAD',
		},
	];

	try {
		const docs = await Promise.all([
			new Message(message).save(),
			new MessageRelation(relation).save(),
		]);
		await messageNotify(reqData.userId, message);

		ctx.rest({
			ok: true,
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	}
};

// 申请加入
const applyMembershipMsg = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'device: add_group_member_unknown_error',
			`系统未知错误`
		);
	}

	let ownerId = '';
	await UserGroup.findOne({ groupId: reqData.groupId }).then(docs => {
		if (!docs.groupId) {
			throw new APIError(
				'group: apply_membership_unknown_error',
				`家庭组不存在`
			);
		}
		ownerId = docs.ownerId;
	});

	const messageId = getMessageId();
	const [message, relation] = [
		{
			messageId: messageId,
			category: 'GROUP',
			type: 'INFO',
			title: '申请加入家庭组',
			content: '申请加入家庭组',
			sender: 'system',
			operation: {
				groupType: 'Apply',
				userId: reqData.userId,
				groupId: reqData.groupId,
				operation: true,
				agree: false,
			},
		},
		{
			messageId: messageId,
			userId: ownerId,
			status: 'UNREAD',
		},
	];

	try {
		const docs = await Promise.all([
			new Message(message).save(),
			new MessageRelation(relation).save(),
		]);
		await messageNotify(ownerId, message);

		console.log(docs);

		ctx.rest({
			ok: true,
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	}
};

// 添加成员处理
const addGroupMemberHandle = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: add_group_member_unknown_error',
			`系统未知错误`
		);
	}

	// const ownerId = '';
	// await UserGroup.findOne({ groupId: reqData.groupId }).then(docs => {
	// 	if (!docs) {
	// 		throw new APIError(
	// 			'group: apply_membership_unknown_error',
	// 			`家庭组不存在`
	// 		);
	// 	}
	// 	ownerId = docs.ownerId;
	// });

	// 拒绝邀请
	if (!reqData.agree) {
		const messageId = getMessageId();
		const [message, relation] = [
			{
				messageId: messageId,
				category: 'GROUP',
				type: 'WARN',
				title: '邀请被拒绝',
				content: '拒绝加入家庭组',
				sender: 'system',
				operation: {
					groupType: 'Refuse_Invite',
					userId: reqData.userId,
					groupId: reqData.groupId,
					operation: false,
				},
			},
			{
				messageId: messageId,
				userId: reqData.sourceId,
				status: 'UNREAD',
			},
		];
		const docs = await Promise.all([
			Message.findOneAndUpdate(
				{ messageId: reqData.messageId },
				{
					operation: {
						groupType: 'Add',
						sourceId: reqData.sourceId,
						userId: reqData.userId,
						groupId: reqData.groupId,
						operation: false,
						agree: false,
					},
				}
			),
			new Message(message).save(),
			new MessageRelation(relation).save(),
		]);
		console.log(docs);
		await messageNotify(reqData.sourceId, message);
		ctx.rest({
			ok: true,
		});
		return;
	}

	// 同意邀请
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
		UserInfo.findOneAndUpdate(
			{ userId: reqData.userId },
			{ groupId: reqData.groupId },
			{
				new: true,
			}
		),
		Message.findOneAndUpdate(
			{ messageId: reqData.messageId },
			{
				operation: {
					groupType: 'Add',
					sourceId: reqData.sourceId,
					userId: reqData.userId,
					groupId: reqData.groupId,
					operation: false,
					agree: reqData.agree,
				},
			},
			{
				new: true,
			}
		),
	])
		.then(docs => {
			const jwToken = jsonWebToken.getToken({
				userId: docs[1].userId,
				groupId: docs[1].groupId,
			});

			ctx.rest({
				token: jwToken,
				userInfo: {
					userId: docs[1].userId,
					groupId: docs[1].groupId,
					nickName: docs[1].nickName,
					avatar: docs[1].avatar,
					intro: docs[1].intro,
					sex: docs[1].sex,
					birthday: docs[1].birthday,
				},
			});
			io.to(reqData.groupId).emit('GroupMessage', {
				type: 'add',
				userId: reqData.userId,
			});
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 入群申请处理
const applyMembershipHandle = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: add_group_member_unknown_error',
			`系统未知错误`
		);
	}

	// const ownerId = '';
	// await UserGroup.findOne({ groupId: reqData.groupId }).then(docs => {
	// 	if (!docs) {
	// 		throw new APIError(
	// 			'group: apply_membership_unknown_error',
	// 			`家庭组不存在`
	// 		);
	// 	}
	// 	ownerId = docs.ownerId;
	// });

	// 拒绝邀请
	if (!reqData.agree) {
		const messageId = getMessageId();
		const [message, relation] = [
			{
				messageId: messageId,
				category: 'GROUP',
				type: 'WARN',
				title: '申请被拒绝',
				content: '申请被拒绝',
				sender: 'system',
				operation: {
					groupType: 'Refuse_Apply',
					userId: reqData.userId,
					groupId: reqData.groupId,
					operation: false,
				},
			},
			{
				messageId: messageId,
				userId: reqData.userId,
				status: 'UNREAD',
			},
		];
		const docs = await Promise.all([
			Message.findOneAndUpdate(
				{ messageId: reqData.messageId },
				{
					operation: {
						groupType: 'Apply',
						userId: reqData.userId,
						groupId: reqData.groupId,
						operation: false,
						agree: false,
					},
				}
			),
			new Message(message).save(),
			new MessageRelation(relation).save(),
		]);
		console.log(docs);
		await messageNotify(reqData.userId, message);
		ctx.rest({
			ok: true,
		});
		return;
	}

	// 同意邀请
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
		Message.updateOne(
			{ messageId: reqData.messageId },
			{
				operation: {
					groupType: 'Apply',
					userId: reqData.userId,
					groupId: reqData.groupId,
					operation: false,
					agree: true,
				},
			}
		),
	])
		.then(docs => {
			ctx.rest({
				ok: true,
			});
			io.to(reqData.groupId).emit('GroupMessage', {
				type: 'add',
				userId: reqData.userId,
			});
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// delete
// 删除 group 成员
const deleteGroupMember = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.query,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError('group: get_group_unknown_error', `系统未知错误`);
	}

	const messageId = getMessageId();
	const [message, relation] = [
		{
			messageId: messageId,
			category: 'GROUP',
			type: 'INFO',
			title: '成员移出群组通知',
			content: '被移出家庭组',
			sender: 'system',
			operation: {
				groupType: 'Delete',
				userId: reqData.userId,
				operation: false,
				agree: false,
			},
		},
		{
			messageId: messageId,
			userId: '',
			status: 'UNREAD',
		},
	];

	const docs = await Promise.all([
		UserGroup.findOneAndUpdate(
			{
				groupId: reqData.groupId,
			},
			{
				$pull: {
					member: { userId: reqData.userId },
				},
			},
			{
				new: true,
			}
		),
		UserInfo.updateOne({ userId: reqData.userId }, { groupId: '' }),
		new Message(message).save(),
	]).catch(error => {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	});

	await docs[0].member.forEach(async el => {
		relation.userId = el.userId;
		await new MessageRelation(relation).save();
		await messageNotify(el.userId, message);
		// const total = await MessageRelation.find({
		// 	userId: el.userId,
		// 	status: 'UNREAD',
		// }).count();
		// io.to(el.userId).emit('message', {
		// 	message: message,
		// 	total: total,
		// });
	});
	if (docs[1].ok) {
		ctx.rest({
			ok: true,
		});
		io.to(reqData.groupId).emit('GroupMessage', {
			type: 'remove', // 删除成员
			userId: reqData.userId,
		});
	}
};

// put
// 更新群信息
const updateGroupInfo = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'user: update_group_info_unknown_error',
			`系统未知错误`
		);
	}

	await UserGroup.findOneAndUpdate(
		{
			groupId: reqData.groupId,
		},
		{
			groupName: reqData.groupName,
			region: reqData.region,
		},
		{
			new: true,
		}
	)
		.then(docs => {
			if (docs) {
				ctx.rest({
					ok: true,
				});
				io.to(reqData.groupId).emit('group', docs);
			} else {
				ctx.rest({
					ok: false,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

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
				as: 'members',
			},
		},
		{
			$project: {
				member: 0,
				__v: 0,
				_id: 0,
				updateTime: 0,
			},
		},
		{
			$match: { groupId: reqData.groupId },
		},
	])
		.then(docs => {
			if (docs.length) {
				ctx.rest(docs[0]);
			} else {
				ctx.rest({ ok: false });
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 获取群组信息
const getGroupInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('group: get_group_unknown_error', `系统未知错误`);
	}

	await UserGroup.findOne({ groupId: reqData.groupId })
		.then(docs => {
			if (docs) {
				ctx.rest(docs);
			} else {
				ctx.rest({ ok: false });
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 加入群组
const joinGroup = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.query,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError('group: get_group_unknown_error', `系统未知错误`);
	}

	await UserGroup.findOne({
		groupId: reqData.groupId,
	})
		.then(docs => {
			if (docs.ownerId) {
				io.to(docs.ownerId).emit('GroupMessage', {
					type: 'Apply', // 申请
					userId: payload.userId,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 退出群组
const exitGroup = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.query,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError('group: exit_group_unknown_error', `系统未知错误`);
	}

	const messageId = getMessageId();
	const [message, relation] = [
		{
			messageId: messageId,
			category: 'GROUP',
			type: 'INFO',
			title: '成员退出群组通知',
			content: '退出家庭组',
			sender: 'system',
			operation: {
				groupType: 'Exit',
				userId: reqData.userId,
				groupId: reqData.groupId,
				operation: false,
				agree: false,
			},
		},
		{
			messageId: messageId,
			userId: '',
			status: 'UNREAD',
		},
	];
	try {
		const docs = await Promise.all([
			UserGroup.findOneAndUpdate(
				{
					groupId: reqData.groupId,
				},
				{
					$pull: {
						member: { userId: reqData.userId },
					},
				},
				{
					new: true,
				}
			),
			UserInfo.findOneAndUpdate(
				{ userId: reqData.userId },
				{ groupId: '' },
				{
					new: true,
				}
			),
			new Message(message).save(),
		]);

		relation.userId = docs[0].ownerId;
		await new MessageRelation(relation).save();
		await messageNotify(docs[0].ownerId, message);
		// const total = await MessageRelation.find({
		// 	userId: docs[0].ownerId,
		// 	status: 'UNREAD',
		// }).countDocuments();
		// io.to(docs[0].ownerId).emit('message', {
		// 	message: message,
		// 	total: total,
		// });

		const jwToken = jsonWebToken.getToken({
			userId: docs[1].userId,
			groupId: docs[1].groupId,
		});
		ctx.rest({
			token: jwToken,
			userInfo: {
				userId: docs[1].userId,
				groupId: docs[1].groupId,
				nickName: docs[1].nickName,
				avatar: docs[1].avatar,
				intro: docs[1].intro,
				sex: docs[1].sex,
				birthday: docs[1].birthday,
			},
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	}
};

// 解散群组
const unGroup = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('group: get_group_unknown_error', `系统未知错误`);
	}

	await Promise.all([
		UserGroup.deleteOne({ groupId: reqData.groupId }),
		UserInfo.updateMany(
			{
				groupId: reqData.groupId,
			},
			{
				groupId: '',
			}
		),
	])
		.then(docs => {
			console.log(docs);
			ctx.rest({
				ok: true,
			});
			io.to(reqData.groupId).emit('GroupMessage', {
				type: 'unGroup', // 解散群组
			});
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

module.exports = {
	// 创建家庭组
	'POST /api/group/setGroup': setGroup,
	// 添加成员邀请
	'POST /api/group/addGroupMemberMsg': addGroupMemberMsg,
	// 加入群组申请
	'POST /api/group/applyMembershipMsg': applyMembershipMsg,
	// 添加成员处理
	'POST /api/group/addGroupMemberHandle': addGroupMemberHandle,
	// 入群申请处理
	'POST /api/group/applyMembershipHandle': applyMembershipHandle,

	// 删除 group 成员
	'DELETE /api/group/deleteGroupMember': deleteGroupMember,
	// 更新群信息
	'PUT /api/group/updateGroupInfo': updateGroupInfo,

	// 获取群组
	'GET /api/group/getGroupById': getGroupById,
	// 获取群组信息
	'GET /api/group/getGroupInfo': getGroupInfo,
	// 加入群组
	'GET /api/group/joinGroup': joinGroup,
	// 退出群组
	'GET /api/group/exitGroup': exitGroup,
	// 解散群组
	'GET /api/group/unGroup': unGroup,
};
