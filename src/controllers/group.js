const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const UserGroup = require('../models/UserGroup');
const House = require('../models/House');
const Message = require('../models/Message');
const MessageRelation = require('../models/MessageRelation');
const Device = require('../models/Device');
const DeviceLog = require('../models/DeviceLog');
const DeviceStatus = require('../models/DeviceStatus');
const DeviceTimedTask = require('../models/DeviceTimedTask');

const APIError = require('../middleware/rest').APIError;
const jsonWebToken = require('../utils/jsonWebToken');
const getId = require('../utils/getId');
const getMessageId = require('../utils/getMessageId');

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
const createGroup = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError('group: create_group_unknown_error', `系统未知错误`);
	}

	await UserInfo.findOne({
		userId: payload.userId,
	}).then(docs => {
		if (docs.groupId) {
			throw new APIError(
				'group: create_group_error',
				`已加入家庭组，请勿重复创建！`
			);
		}
	});

	const [groupId, roomId] = [getId(10), getId(8)];
	const jwToken = jsonWebToken.getToken({
		userId: payload.userId,
		groupId: groupId,
	});

	await Promise.all([
		UserInfo.findOneAndUpdate(
			{
				userId: payload.userId,
			},
			{
				groupId: groupId,
			},
			{
				new: true,
			}
		),
		new UserGroup({
			groupId: groupId,
			ownerId: payload.userId,
			groupName: reqData.groupName,
			region: reqData.region,
			member: [
				{
					userId: payload.userId,
				},
			],
		}).save(),
		new House({
			groupId: groupId,
			rooms: [
				{
					roomId: roomId,
					name: '客厅',
					icon: 'icon-shafa',
				},
			],
		}).save(),
	])
		.then(docs => {
			ctx.rest({
				token: jwToken,
				userInfo: {
					userId: docs[0].userId,
					groupId: docs[0].groupId,
					nickName: docs[0].nickName,
					avatar: docs[0].avatar,
					intro: docs[0].intro,
					sex: docs[0].sex,
					birthday: docs[0].birthday,
					region: docs[0].region,
				},
			});
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('sign: unknown_error', `系统未知错误`);
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

// 入群邀请处理
const addGroupMemberHandle = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError(
			'device: add_group_member_unknown_error',
			`系统未知错误`
		);
	}

	const docs_group = await Promise.all([
		UserGroup.findOne({ groupId: reqData.groupId }),
		UserInfo.findOne({
			userId: reqData.userId,
		}),
	]);
	let operation = {
		groupType: 'Add',
		sourceId: reqData.sourceId,
		userId: reqData.userId,
		groupId: reqData.groupId,
		error: '',
		operation: false,
		agree: false,
	};

	// 群组已解散处理
	if (!docs_group[0].groupId.length) {
		operation.error = '家庭组已解散';
		await Message.updateOne(
			{ messageId: reqData.messageId },
			{
				operation: operation,
			}
		);
		throw new APIError(
			'group: apply_membership_unknown_error',
			`家庭组已解散`
		);
	}

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

	// 已加入另一群组
	if (docs_group[1].groupId.length) {
		operation.error = '已处理';
		await Message.updateOne(
			{ messageId: reqData.messageId },
			{
				operation: operation,
			}
		);
		throw new APIError(
			'group: apply_membership_unknown_error',
			`已加入家庭组，请勿重复加入！`
		);
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
		Message.updateOne(
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
			}
		),
	])
		.then(docs => {
			const jwToken = jsonWebToken.getToken({
				userId: docs[1].userId,
				groupId: docs[1].groupId,
			});
			io.to(docs[1].userId).emit('joinGroup', {
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
			ctx.rest({ ok: true });
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

	const docs_group = await Promise.all([
		UserGroup.findOne({ groupId: reqData.groupId }),
		UserInfo.findOne({
			userId: reqData.userId,
		}),
	]);
	let operation = {
		groupType: 'Apply',
		sourceId: reqData.sourceId,
		userId: reqData.userId,
		groupId: reqData.groupId,
		error: '',
		operation: false,
		agree: false,
	};

	// 群组已解散处理
	if (!docs_group[0].groupId.length) {
		operation.error = '家庭组已解散';
		await Message.updateOne(
			{ messageId: reqData.messageId },
			{
				operation: operation,
			}
		);
		throw new APIError(
			'group: apply_membership_unknown_error',
			`家庭组已解散`
		);
	}

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
		await messageNotify(reqData.userId, message);
		ctx.rest({
			ok: true,
		});
		return;
	}

	// 已加入另一群组
	if (docs_group[1].groupId.length) {
		operation.error = '用户已加入其他群组';
		await Message.updateOne(
			{ messageId: reqData.messageId },
			{
				operation: operation,
			}
		);
		throw new APIError(
			'group: apply_membership_unknown_error',
			`用户已加入其他群组`
		);
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
			const jwToken = jsonWebToken.getToken({
				userId: docs[1].userId,
				groupId: docs[1].groupId,
			});
			io.to(docs[1].userId).emit('joinGroup', {
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
			ctx.rest({
				ok: true,
			});
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 添加房间
const addRoom = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError('group: create_group_unknown_error', `系统未知错误`);
	}

	const roomId = getId(8);

	await House.findOneAndUpdate(
		{ groupId: reqData.groupId },
		{
			$push: {
				rooms: {
					roomId: roomId,
					name: reqData.name,
					icon: reqData.icon,
				},
			},
		},
		{
			new: true,
		}
	)
		.then(docs => {
			if (docs.groupId) {
				io.to(reqData.groupId).emit('updateRooms', {
					type: 'add',
					data: {
						roomId: roomId,
						name: reqData.name,
						icon: reqData.icon,
					},
				});
				ctx.rest({
					ok: true,
					name: reqData.name,
					icon: reqData.icon,
				});
			} else {
				ctx.rest({
					ok: false,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: unknown_error', `系统未知错误`);
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
		throw new APIError('group: delete_group_unknown_error', `系统未知错误`);
	}

	try {
		await UserInfo.findOne({ userId: reqData.userId }).then(docs => {
			if (!docs.groupId || docs.groupId !== reqData.groupId) {
				throw new APIError(
					'group: delete_group_error',
					`用户已退出当前群`
				);
			}
		});

		const messageId = getMessageId();
		const messageId_own = getMessageId();
		const [message, message_own, relation_own] = [
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
				messageId: messageId_own,
				category: 'GROUP',
				type: 'WARN',
				title: '移出群组通知',
				content: '被移出家庭组',
				sender: 'system',
				operation: {
					groupType: 'Delete_Own',
					groupId: reqData.groupId,
					operation: false,
					agree: false,
				},
			},
			{
				messageId: messageId_own,
				userId: reqData.userId,
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
			UserInfo.findOneAndUpdate(
				{ userId: reqData.userId },
				{ groupId: '' },
				{
					new: true,
				}
			),
			new Message(message).save(),
			new Message(message_own).save(),
		]);

		// 被删除的用户通知
		await new MessageRelation(relation_own).save();
		await messageNotify(reqData.userId, message_own);

		// 家庭组其他成员
		let Relations = [];
		docs[0].member.forEach(el => {
			Relations.push(
				new MessageRelation({
					messageId: messageId,
					userId: el.userId,
					status: 'UNREAD',
				})
			);
		});
		await MessageRelation.insertMany(Relations);
		for (const el of docs[0].member) {
			await messageNotify(el.userId, message);
		}

		const jwToken = jsonWebToken.getToken({
			userId: reqData.userId,
			groupId: '',
		});
		io.to(reqData.userId).emit('exitGroup', {
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
			type: 'remove', // 删除成员
			userId: reqData.userId,
		});
		ctx.rest({
			ok: true,
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	}
};

// 删除房间
const deleteHouse = async (ctx, next) => {
	const reqData = ctx.request.query;

	if (!reqData) {
		throw new APIError('group: delete_house_unknown_error', `系统未知错误`);
	}

	await House.findOneAndUpdate(
		{
			groupId: reqData.groupId,
		},
		{
			$pull: {
				rooms: { roomId: reqData.roomId },
			},
		},
		{
			new: true,
		}
	)
		.then(docs => {
			if (docs.groupId) {
				ctx.rest({
					ok: true,
				});
				io.to(reqData.groupId).emit('updateRooms', {
					type: 'delete',
					data: {
						roomId: reqData.roomId,
					},
				});
			} else {
				ctx.rest({
					ok: false,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
		});
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
			throw new APIError('group: database_error', `系统未知错误`);
		});
};

// 更新房间
const updateHouse = async (ctx, next) => {
	const reqData = ctx.request.body;
	if (!reqData) {
		throw new APIError('user: update_house_unknown_error', `系统未知错误`);
	}

	await House.findOneAndUpdate(
		{
			groupId: reqData.groupId,
			'rooms.roomId': reqData.roomId,
		},
		{
			$set: {
				'rooms.$.icon': reqData.icon,
				'rooms.$.name': reqData.name,
			},
		},
		{
			new: true,
		}
	)
		.then(docs => {
			if (docs.groupId) {
				ctx.rest({
					ok: true,
				});
				io.to(reqData.groupId).emit('updateRooms', {
					type: 'update',
					data: {
						roomId: reqData.roomId,
						icon: reqData.icon,
						name: reqData.name,
					},
				});
			} else {
				ctx.rest({
					ok: false,
				});
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('group: database_error', `系统未知错误`);
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
				from: 'userInfo',
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

// 获取房间信息
const getHouse = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('group: get_house_unknown_error', `系统未知错误`);
	}

	await House.findOne({ groupId: reqData.groupId })
		.then(docs => {
			if (docs) {
				ctx.rest(docs.rooms);
			} else {
				ctx.rest({ ok: false });
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

		const jwToken = jsonWebToken.getToken({
			userId: docs[1].userId,
			groupId: docs[1].groupId,
		});
		io.to(reqData.userId).emit('exitGroup', {
			token: jwToken,
		});

		relation.userId = docs[0].ownerId;
		await new MessageRelation(relation).save();
		await messageNotify(docs[0].ownerId, message);

		io.to(reqData.groupId).emit('GroupMessage', {
			type: 'remove',
			userId: docs[1].userId,
		});

		ctx.rest({ ok: true });
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

	try {
		const group = await UserGroup.findOne({ groupId: reqData.groupId });
		const messageId = getMessageId();
		const message = {
			messageId: messageId,
			category: 'GROUP',
			type: 'WARN',
			title: '群组解散通知',
			content: `群主已将家庭组 ${group.groupName}(${
				group.groupId
			}) 解散！`,
			sender: 'system',
			operation: {
				groupType: 'Ungroup',
				operation: false,
				agree: false,
			},
		};
		const docs = await Promise.all([
			Device.deleteMany({ groupId: reqData.groupId }),
			DeviceLog.deleteMany({ groupId: reqData.groupId }),
			DeviceStatus.deleteMany({ groupId: reqData.groupId }),
			DeviceTimedTask.deleteMany({ groupId: reqData.groupId }),
			House.deleteOne({ groupId: reqData.groupId }),
			UserGroup.deleteOne({ groupId: reqData.groupId }),
			UserInfo.updateMany(
				{
					groupId: reqData.groupId,
				},
				{
					groupId: '',
				}
			),
			new Message(message).save(),
		]);

		// 解散通知
		let Relations = [];
		group.member.forEach(el => {
			Relations.push(
				new MessageRelation({
					messageId: messageId,
					userId: el.userId,
					status: 'UNREAD',
				})
			);
		});
		await MessageRelation.insertMany(Relations);
		for (const el of group.member) {
			await messageNotify(el.userId, message);
			const jwToken = jsonWebToken.getToken({
				userId: el.userId,
				groupId: '',
			});
			io.to(el.userId).emit('exitGroup', {
				token: jwToken,
			});
		}

		ctx.rest({
			ok: true,
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	}
};

module.exports = {
	// 创建家庭组
	'POST /api/group/createGroup': createGroup,
	// 入群邀请
	'POST /api/group/addGroupMemberMsg': addGroupMemberMsg,
	// 入群组申请
	'POST /api/group/applyMembershipMsg': applyMembershipMsg,
	// 入群邀请处理
	'POST /api/group/addGroupMemberHandle': addGroupMemberHandle,
	// 入群申请处理
	'POST /api/group/applyMembershipHandle': applyMembershipHandle,
	// 添加房间
	'POST /api/group/addRoom': addRoom,

	// 删除 group 成员
	'DELETE /api/group/deleteGroupMember': deleteGroupMember,
	// 删除房间
	'DELETE /api/group/deleteHouse': deleteHouse,

	// 更新群信息
	'PUT /api/group/updateGroupInfo': updateGroupInfo,
	// 更新房间
	'PUT /api/group/updateHouse': updateHouse,

	// 获取群组
	'GET /api/group/getGroupById': getGroupById,
	// 获取群组信息
	'GET /api/group/getGroupInfo': getGroupInfo,
	// 获取设备 Id
	'GET /api/group/getHouse': getHouse,
	// 退出群组
	'GET /api/group/exitGroup': exitGroup,
	// 解散群组
	'GET /api/group/unGroup': unGroup,
};
