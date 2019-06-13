const request = require('request');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const OAuth = require('../models/OAuth');

const mqttClient = require('../middleware/mqttClient');
const APIError = require('../middleware/rest').APIError;
const signHash = require('../utils/hash');
const jsonWebToken = require('../utils/jsonWebToken');

// 授权关联
const weChatAuthorize = async (ctx, next) => {
	let [reqData = '', query] = [ctx.request.body, {}];
	if (!reqData) {
		throw new APIError('weChat: unknown_error', `系统未知错误`);
	}

	query[reqData.type] = reqData.id;
	const docs = await UserFind(query);
	if (!docs[0]) {
		throw new APIError('weChat: account_not_registered', `账号未注册`);
	}

	const hmacPassWord = signHash.hmacPassWord(
		docs[0].userId,
		reqData.password
	);
	if (hmacPassWord !== docs[0].password) {
		throw new APIError('weChat: wrong_spassword', `密码错误`);
	}

	// 获取openid
	let resData = await getOpenId(reqData.code).catch(error => {
		console.log(error);
		throw new APIError('weChat: unknown_error', `系统未知错误`);
	});
	resData = JSON.parse(resData);
	if (!resData.openid) {
		ctx.rest({ ok: false });
		return;
	}

	// 查看是否已授权
	const OAuthData = await OAuth.findOne({ userId: docs[0].userId });
	if (OAuthData) {
		throw new APIError('weChat: unknown_error', `账号已授权`);
	}

	await new OAuth({
		userId: docs[0].userId,
		oauthName: 'weChat',
		oauthId: resData.openid,
	}).save();

	ctx.rest({
		token: jsonWebToken.getToken({
			userId: docs[0].userId,
			groupId: docs[0].userInfo.groupId,
		}),
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
};

// 微信登录
const weChatSignIn = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('weChat: unknown_error', `系统未知错误`);
	}

	const code = reqData.code;
	let resData = await getOpenId(code).catch(error => {
		console.log(error);
		throw new APIError('weChat: unknown_error', `系统未知错误`);
	});
	resData = JSON.parse(resData);

	const docs = await OAuth.findOne({ oauthId: resData.openid }).catch(
		error => {
			console.log(error);
			throw new APIError('weChat: unknown_error', `系统未知错误`);
		}
	);
	if (!docs) {
		ctx.rest({
			ok: false,
		});
		return;
	}

	await UserFind({ userId: docs.userId }).then(docs => {
		const jwToken = jsonWebToken.getToken({
			userId: docs[0].userId,
			groupId: docs[0].userInfo.groupId,
		});

		ctx.rest({
			ok: true,
			token: jwToken,
			userInfo: {
				userId: docs[0].userId,
				groupId: docs[0].userInfo.groupId,
				nickName: docs[0].userInfo.nickName,
				avatar: docs[0].userInfo.avatar,
				intro: docs[0].userInfo.intro,
				sex: docs[0].userInfo.sex,
				birthday: docs[0].userInfo.birthday,
			},
		});
	});
};

// 获取 openid
const getOpenId = code => {
	return new Promise((resolve, reject) => {
		const id = 'wx3605ab544a17816b'; // AppID(小程序ID)
		const secret = '90b17566cc9012676c8184e47e82d0db'; // AppSecret(小程序密钥)
		let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${id}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
		request(url, (error, response, body) => {
			if (error) reject(error);
			resolve(body);
		});
	});
};

// get userInfo
const UserFind = query => {
	return User.aggregate([
		{
			$match: query,
		},
		{
			$lookup: {
				from: 'userInfo',
				localField: 'userId',
				foreignField: 'userId',
				as: 'userInfo',
			},
		},
		{
			$unwind: {
				path: '$userInfo',
				preserveNullAndEmptyArrays: true,
			},
		},
	]);
};

//小车控制
const carCtrl = async (ctx, next) => {
	const reqData = ctx.request.body;
	try {
		await Promise.all([
			mqttClient.MQTTPublish(
				reqData.groupId,
				reqData.deviceId,
				reqData.desired
			),
		]);
		ctx.rest({ ok: true });
	} catch (error) {
		console.log(error.message);
		throw new APIError('device: database_error', `系统未知错误`);
	}
};

module.exports = {
	// 微信登录
	'GET /api/user/weChatSignIn': weChatSignIn,

	// 授权关联
	'POST /api/user/weChatAuthorize': weChatAuthorize,

	//小车控制
	'POST /api/user/carCtrl': carCtrl,
};
