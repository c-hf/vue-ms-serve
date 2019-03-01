const Message = require('../models/Message');
const MessageRelation = require('../models/MessageRelation');

const jsonWebToken = require('../utils/jsonWebToken');

// Error 对象
const APIError = require('../middleware/rest').APIError;

// 获取未读消息数
const messageUnreadNum = async userId => {
	const total = await MessageRelation.find({
		userId: userId,
		status: 'UNREAD',
	}).countDocuments();

	io.to(userId).emit('message', {
		total: total,
	});
};

// post
// 查找消息
const getMessages = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];

	if (!reqData) {
		throw new APIError('user: get_messages_unknown_error', `系统未知错误`);
	}

	let query = {
		userId: payload.userId,
	};
	Object.keys(reqData.query).forEach(el => {
		if (!reqData.query[el]) {
			return;
		}
		el === 'category'
			? (query['message.category'] = reqData.query[el])
			: (query[el] = reqData.query[el]);
	});

	await Promise.all([
		messagesFind(query).group({
			_id: null,
			count: { $sum: 1 },
		}),
		messagesFind(query)
			.sort({ _id: -1 })
			.skip(Number(reqData.pageNo) * Number(reqData.pageSize))
			.limit(Number(reqData.pageSize)),
	])
		.then(docs => {
			if (docs.length && docs[1].length) {
				ctx.rest({
					total: docs[0][0].count,
					page: docs[1],
				});
			} else {
				ctx.rest({ total: 0, page: [] });
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// {
//     $or : [ //多条件，数组
//         {nick : {$regex : reg}},
//         {email : {$regex : reg}}
//     ]
// },
// 查找消息
const getSearchMessages = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];

	if (!reqData) {
		throw new APIError('user: get_messages_unknown_error', `系统未知错误`);
	}
	const reg = new RegExp(reqData.keyword, 'i');
	let query = {
		$or: [
			{
				userId: payload.userId,
				'message.title': { $regex: reg },
			},
		],
	};
	Object.keys(reqData.query).forEach(el => {
		if (!reqData.query[el]) {
			return;
		}
		el === 'category'
			? (query['$or'][0]['message.category'] = reqData.query[el])
			: (query['$or'][0][el] = reqData.query[el]);
	});

	await Promise.all([
		messagesFind(query).group({
			_id: null,
			count: { $sum: 1 },
		}),
		messagesFind(query)
			.sort({ _id: -1 })
			.skip(Number(reqData.pageNo) * Number(reqData.pageSize))
			.limit(Number(reqData.pageSize)),
	])
		.then(docs => {
			if (docs.length && docs[1].length) {
				ctx.rest({
					total: docs[0][0].count,
					page: docs[1],
				});
			} else {
				ctx.rest({ total: 0, page: [] });
			}
		})
		.catch(error => {
			console.log(error.message);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// 删除消息
const deleteMessage = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError('group: get_group_unknown_error', `系统未知错误`);
	}

	try {
		await MessageRelation.deleteMany(
			{
				messageId: {
					$in: reqData,
				},
			},
			{
				status: 'READ',
			}
		);
		const total = await MessageRelation.find({
			userId: payload.userId,
			status: 'UNREAD',
		}).countDocuments();
		io.to(payload.userId).emit('message', {
			total: total,
		});
		ctx.rest({
			ok: true,
		});
	} catch (error) {
		console.log(error.message);
		throw new APIError('group: database_error', `系统未知错误`);
	}
};

// put
// 设为已读
const updateMessageStatus = async (ctx, next) => {
	const [reqData, payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'user: update_message_status_unknown_error',
			`系统未知错误`
		);
	}

	try {
		await MessageRelation.updateMany(
			{
				messageId: {
					$in: reqData,
				},
			},
			{
				status: 'READ',
			}
		);
		const total = await MessageRelation.find({
			userId: payload.userId,
			status: 'UNREAD',
		}).countDocuments();
		io.to(payload.userId).emit('message', {
			total: total,
		});
		ctx.rest({ ok: true });
	} catch (error) {
		console.log(error.message);
		throw new APIError('user: database_error', `系统未知错误`);
	}
};

// get

// unit
// 消息查询
const messagesFind = query => {
	return MessageRelation.aggregate([
		{
			// 左连接
			$lookup: {
				from: 'messages',
				localField: 'messageId',
				foreignField: 'messageId',
				as: 'message', // 分组名
			},
		},
		{
			$match: query, // 查询条件
		},
		{
			$unwind: {
				path: '$message', // 拆分子数组
				preserveNullAndEmptyArrays: true, // 空的数组也拆分
			},
		},
		{
			$project: {
				__v: 0,
				'message.__v': 0,
				'message._id': 0,
			},
		},
	]);
};

module.exports = {
	// 获取消息
	'POST /api/message/getMessages': getMessages,
	// 查找消息
	'POST /api/message/getSearchMessages': getSearchMessages,
	// 删除信息
	'POST /api/message/deleteMessage': deleteMessage,

	// 消息设为已读
	'PUT /api/message/updateMessageStatus': updateMessageStatus,
};
