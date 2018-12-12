const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const UserRole = require('../models/UserRole');
const UserGroup = require('../models/UserGroup');
const House = require('../models/House');
const VerificationCode = require('../models/VerificationCode');

const sendEmail = require('../utils/email');
const signHash = require('../utils/hash');
const getCode = require('../utils/code');
const jsonWebToken = require('../utils/jsonWebToken');
const getId = require('../utils/getId');
// Error 对象
const APIError = require('../middleware/rest').APIError;
// 图片上传路径
const imgUrlPath = require('../config/index').imgUrlPath;
const imgUrl = require('../config/index').imgUrl;
const path = require('path');
const fs = require('fs');

// 邮件配置
let mail = require('../config/index').mail;

// post
// 发送验证码
const sendCode = async (ctx, next) => {
	let [reqData = '', msgType, query] = [ctx.request.body, '', {}];
	if (!reqData) {
		throw new APIError('sign: code_unknown_error', `系统未知错误`);
	}
	query[reqData.type] = reqData.id;

	await User.findOne(query).then(docs => {
		if (docs) {
			reqData.type === 'phone'
				? (msgType = '手机号')
				: (msgType = '邮箱');
			throw new APIError(
				`sign: ${reqData.type}_already_exists`,
				`${msgType}已被注册`
			);
		}
	});

	// 时间
	const date = new Date();
	const [userCode, currentDate, currentTime] = [
		getCode(),
		date
			.toLocaleDateString()
			.split('/')
			.join('-'),
		date.getTime(),
	];

	mail.subject = '邮箱注册-验证邮件';
	mail.to = reqData.id;
	mail.html = `<h2 style="height: 30px;line-height: 30px;">亲爱的用户：</h2>
	    <div style="height: 10px;"></div>
	    <p style="height: 30px;line-height: 30px;">
	        本次请求的邮件验证码为：<span style="padding: 0 10px;border-bottom: 1px dashed rgb(204, 204, 204); color: #F90; font-size: 18px; font-weight: bold; height: 30px; line-height: 30px;">${userCode}</span>；本验证码 5 分钟内有效，请及时输入。
	    </p>
	    <p>
	        如非本人操作，请忽略该邮件。（这是一封自动发送的邮件，请不要直接回复）
	    </p>
	    <div style="height: 10px;"></div>
	    <p>CHFeng</p>
	    <p style="height: 30px;line-height: 30px;">${currentDate}</p>`;

	await sendEmail(mail)
		.then(info => {
			if (
				info.response.startsWith('2') ||
				info.response.startsWith('3')
			) {
				VerificationCode.findOne({
					id: reqData.id,
				});
			}
		})
		.then(docs => {
			// console.log(docs);
			if (docs) {
				VerificationCode.deleteOne({ id: reqData.id });
			}
			new VerificationCode({
				id: reqData.id,
				code: userCode,
				date: currentTime,
				validTime: 300000,
			}).save();
		})
		.catch(error => {
			console.log(error);
			throw new APIError('sign: mail_unknown_error', `系统未知错误`);
		})
		.then(() => {
			ctx.rest('ok');
		});
};

// 注册
const signUp = async (ctx, next) => {
	let [reqData = '', msgType, query, date] = [
		ctx.request.body,
		'',
		{},
		new Date().getTime(),
	];
	if (!reqData) {
		throw new APIError('sign: unknown_error', `系统未知错误`);
	}

	query[reqData.type] = reqData.id;
	await User.findOne(query).then(docs => {
		if (docs) {
			reqData.type === 'phone'
				? (msgType = '手机号')
				: (msgType = '邮箱');
			throw new APIError(
				'sign: user_already_exists',
				`${msgType}已被注册`
			);
		}
	});

	await VerificationCode.findOne({
		id: reqData.id,
		code: reqData.code,
	})
		.then(docs => {
			if (!docs) {
				throw new APIError(
					'sign: verification_code_is_wrong',
					'验证码错误'
				);
			} else if (date - docs.date > docs.validTime) {
				throw new APIError(
					'sign: verification_code_has_expired',
					'验证码已过期'
				);
			}
		})
		.then(() => {
			VerificationCode.deleteOne({
				id: reqData.id,
				code: reqData.code,
			});
		});

	// userId
	const userId = getId(10);
	// hmac密钥, token
	const [hmacPassWord, jwToken] = [
		signHash.hmacPassWord(userId, reqData.password),
		jsonWebToken.getToken({
			userId: userId,
			groupId: '',
		}),
	];

	// 存入数据库
	let [user, userInfo, userRole] = [
		{
			userId: userId,
			password: hmacPassWord,
			email: '',
			phone: '',
		},
		{
			userId: userId,
			groupId: '',
			nickName: reqData.nickName,
			avatar: '',
			sex: '',
			intro: '',
			birthday: '',
		},
		{
			userId: userId,
		},
	];
	user[reqData.type] = reqData.id;

	await Promise.all([
		new User(user).save(),
		new UserInfo(userInfo).save(),
		new UserRole(userRole).save(),
	])
		.then(() => {
			ctx.rest({
				token: jwToken,
				userInfo: {
					userId: userId,
					nickName: reqData.nickName,
				},
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('sign: unknown_error', `系统未知错误`);
		});
};

// 登录
const signIn = async (ctx, next) => {
	let [reqData = '', query] = [ctx.request.body, {}];
	if (!reqData) {
		throw new APIError('sign: unknown_error', `系统未知错误`);
	}
	query[reqData.type] = reqData.id;
	await UserFind(query)
		.then(docs => {
			return docs;
		})
		.catch(error => {
			console.log(error);
			throw new APIError('sign: database_error', `系统未知错误`);
		})
		.then(docs => {
			if (!docs[0]) {
				throw new APIError(
					'sign: account_not_registered',
					`账号未注册`
				);
			}

			const hmacPassWord = signHash.hmacPassWord(
				docs[0].userId,
				reqData.password
			);

			if (hmacPassWord !== docs[0].password) {
				throw new APIError('sign: wrong_spassword', `密码错误`);
			}

			// token
			const jwToken = jsonWebToken.getToken({
				userId: docs[0].userId,
				groupId: docs[0].userInfo.groupId,
			});
			ctx.rest({
				token: jwToken,
				userInfo: {
					userId: docs[0].userId,
					groupId: docs[0].userInfo.groupId,
					nickName: docs[0].userInfo.nickName,
					avatar: docs[0].userInfo.avatar,
					intro: docs[0].userInfo.intro,
					sex: docs[0].userInfo.sex,
					birthday: docs[0].userInfo.birthday,
					region: docs[0].userInfo.region,
				},
			});
		});
};

// 上传头像
const setUserAvatar = async (ctx, next) => {
	// 获取上传文件
	const file = ctx.request.files.file;

	if (!file) {
		throw new APIError(
			'user: set_user_avatar_unknown_error',
			`系统未知错误`
		);
	}
	try {
		// 创建可读流
		const reader = fs.createReadStream(file.path);
		const [name, suffix] = [getId(12), file.name.split('.')];

		const filePath =
			path.join(__dirname, '../../', imgUrlPath) +
			`/${name}.${suffix[suffix.length - 1]}`;

		// 创建可写流,可读流通过管道写入可写流
		reader.pipe(fs.createWriteStream(filePath));

		ctx.rest({
			url: `${imgUrl}${name}.${suffix[suffix.length - 1]}`,
		});
	} catch (error) {
		console.log(error);
		throw new APIError(
			'user: set_user_avatar_unknown_error',
			`系统未知错误`
		);
	}
};

// 完善资料
const perfectInformation = async (ctx, next) => {
	const [reqData = '', payload] = [
		ctx.request.body,
		jsonWebToken.getJWTPayload(ctx.headers.authorization),
	];
	if (!reqData) {
		throw new APIError(
			'user: perfect_information_unknown_error',
			`系统未知错误`
		);
	}
	await UserInfo.findOne({ userId: payload.userId }).then(docs => {
		if (docs.groupId.length) {
			throw new APIError('user: groups_already_exist', `已创建家庭组`);
		}
	});

	const [groupId, roomId] = [getId(10), getId(3)];
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
				avatar: reqData.personalData.avatar,
				sex: reqData.personalData.sex,
				birthday: reqData.personalData.birthday,
			},
			{
				new: true,
			}
		),
		new UserGroup({
			groupId: groupId,
			ownerId: payload.userId,
			groupName: reqData.householdGroupData.groupName,
			region: reqData.householdGroupData.region,
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
					icon: '',
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
				groupInfo: {
					groupId: docs[1].groupId,
					groupName: docs[1].groupName,
					ownerId: docs[1].ownerId,
					member: docs[1].member,
					region: docs[1].region,
				},
				rooms: docs[2].rooms,
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('sign: unknown_error', `系统未知错误`);
		});
};

// get
// 登出
const signOut = async (ctx, next) => {
	const payload = jsonWebToken.getJWTPayload(ctx.headers.authorization);
	ctx.rest('ok');
};

// 获取头像
const getUserAvatar = async (ctx, next) => {
	let [reqData = '', query] = [ctx.request.query, {}];
	if (!reqData) {
		throw new APIError('sign: unknown_error', `系统未知错误`);
	}
	query[reqData.type] = reqData.id;

	await User.aggregate([
		{
			$lookup: {
				from: 'usersInfo',
				localField: 'userId',
				foreignField: 'userId',
				as: 'userInfo',
			},
		},
		{
			$match: query,
		},
	])
		.then(docs => {
			return docs;
		})
		.catch(error => {
			console.log(error);
			throw new APIError('sign: database_error', `系统未知错误`);
		})
		.then(docs => {
			if (!docs[0]) {
				throw new APIError(
					'sign: account_not_registered',
					`账号未注册`
				);
			}
			ctx.rest({
				avatar: docs[0].userInfo[0].avatar,
			});
		});
};

// 获取 user info
const getUserInfo = async (ctx, next) => {
	const payload = jsonWebToken.getJWTPayload(ctx.headers.authorization);
	if (!payload) {
		throw new APIError('user: get_user_info_unknown_error', `系统未知错误`);
	}
	await UserInfo.findOne({ userId: payload.userId })
		.then(docs => {
			ctx.rest({
				userId: docs.userId,
				groupId: docs.groupId,
				nickName: docs.nickName,
				avatar: docs.avatar,
				intro: docs.intro,
				sex: docs.sex,
				birthday: docs.birthday,
				region: docs.region,
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// 查找 user
const getUserById = async (ctx, next) => {
	const [reqData, query] = [ctx.request.query, {}];
	if (!reqData) {
		throw new APIError('user: get_user_unknown_error', `系统未知错误`);
	}
	query[reqData.type] = reqData.id;
	await UserFind(query)
		.then(docs => {
			console.log(docs);
			if (!docs[0].userId) {
				ctx.rest({
					ok: false,
				});
			}
			ctx.rest({
				ok: true,
				data: {
					userId: docs[0].userId,
					nickName: docs[0].userInfo.nickName,
					avatar: docs[0].userInfo.avatar,
					intro: docs[0].userInfo.intro,
					sex: docs[0].userInfo.sex,
				},
			});
		})
		.catch(error => {
			console.log(error);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// 用户查询
const UserFind = query => {
	return User.aggregate([
		{
			$match: query, // 查询条件
		},
		{
			// 左连接
			$lookup: {
				from: 'usersInfo', // 关联到 usersInfo 表
				localField: 'userId', // User 表关联的字段
				foreignField: 'userId', // usersInfo 表关联的字段
				as: 'userInfo', // 分组名
			},
		},
		{
			$unwind: {
				path: '$userInfo', // 拆分子数组
				preserveNullAndEmptyArrays: true, // 空的数组也拆分
			},
		},
	]);
};

module.exports = {
	// 验证码
	'POST /api/user/sendCode': sendCode,
	// 头像
	'GET /api/user/getUserAvatar': getUserAvatar,
	// 注册
	'POST /api/user/signUp': signUp,
	// 登录
	'POST /api/user/signIn': signIn,
	// 上传头像
	'POST /api/user/setUserAvatar': setUserAvatar,
	// 完善信息
	'POST /api/user/perfectInformation': perfectInformation,

	// 登出
	'GET /api/user/signOut': signOut,
	// 获取 user info
	'GET /api/user/getUserInfo': getUserInfo,
	// 查找 user byId
	'GET /api/user/getUserById': getUserById,
};
