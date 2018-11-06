const jwt = require('jsonwebtoken');

const userHelper = require('../database/userHelper');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const VerificationCode = require('../models/VerificationCode');

const sendEmail = require('../utils/email');
const signHash = require('../utils/signHash');
const getCode = require('../utils/code');
const APIError = require('../middleware/rest').APIError;
const jwtSecret = require('../config/index').jwtSecret; // jwt密钥

// token 期限 1 小时
const getToken = (content = {}) => {
	return jwt.sign(content, jwtSecret, { expiresIn: 60 * 60 * 1 });
};

// 解析JWT
function getJWTPayload(token) {
	return jwt.verify(token.split(' ')[1], jwtSecret);
}

// 邮件配置
let mail = require('../config/index').mail;

// 发送验证码
const sendCode = async (ctx, next) => {
	let [reqData = '', msgType, query] = [ctx.request.body, '', {}, null];
	if (!reqData) {
		throw new APIError('sign: code_unknown_error', `系统未知错误`);
	}
	query[reqData.type] = reqData.id;

	const userData = await userHelper.findFilterUser(query);
	if (userData) {
		reqData.type === 'phone' ? (msgType = '手机号') : (msgType = '邮箱');
		throw new APIError(
			`sign: ${reqData.type}_already_exists`,
			`${msgType}已被注册`
		);
	}

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

	await sendEmail(mail).then(info => {
		if (info.response.startsWith('2') || info.response.startsWith('3')) {
			const codeData = userHelper.findFilterVerificationCode({
				id: reqData.id,
			});
			if (codeData) {
				userHelper.deleteCode({ id: reqData.id });
			}
			try {
				new VerificationCode({
					id: reqData.id,
					code: userCode,
					date: currentTime,
					validTime: 300000,
				}).save();
			} catch (error) {
				console.log(err);
				throw new APIError('sign: mail_unknown_error', `系统未知错误`);
			}
			ctx.rest('ok');
		}
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
	const userData = await userHelper.findFilterUser(query);
	// console.log(`User: ${userData}`);
	if (userData) {
		userData = null;
		reqData.type === 'phone' ? (msgType = '手机号') : (msgType = '邮箱');
		throw new APIError('sign: user_already_exists', `${msgType}已被注册`);
	}

	const codeData = await userHelper.findFilterVerificationCode({
		id: reqData.id,
	});
	// console.log(`Code: ${codeData}`);
	if (!codeData) {
		throw new APIError(
			'sign: verification_code_has_expired',
			`验证码已失效`
		);
	} else {
		if (date - codeData.date > codeData.validTime) {
			throw new APIError(
				'sign: verification_code_has_expired',
				`验证码已过期`
			);
		} else if (reqData.code !== codeData.code) {
			throw new APIError(
				'sign: verification_code_is_wrong',
				`验证码错误`
			);
		}
		await userHelper.deleteCode({ id: reqData.id });
	}

	// id
	const hashId = signHash.hashId(reqData.id);
	// hmac密钥
	const hmacPassWord = signHash.hmacPassWord(hashId, reqData.password);

	// 存入数据库
	let [user, userInfo] = [
		{
			id: hashId,
			password: hmacPassWord,
			email: '',
			phone: '',
		},
		{
			id: hashId,
			nickName: reqData.nickName,
			intro: '',
			sex: '',
			birthday: '',
			region: '',
		},
	];
	user[reqData.type] = reqData.id;
	await Promise.all([new User(user).save(), new UserInfo(userInfo).save()])
		.then(() => {
			ctx.rest('ok');
		})
		.catch(err => {
			console.log(err);
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
	const userData = await userHelper.findFilterUser(query);

	if (!userData) {
		throw new APIError('sign: account_not_registered', `账号未注册`);
	}

	const hmacPassWord = signHash.hmacPassWord(userData.id, reqData.password);

	if (hmacPassWord !== userData.password) {
		throw new APIError('sign: wrong_spassword', `密码错误`);
	}

	// token
	const jwToken = getToken({ id: userData.id });
	ctx.rest({
		token: jwToken,
	});
};

const signOut = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);
	ctx.rest('ok');
};

const userAvatar = async (ctx, next) => {
	let [reqData = '', query] = [ctx.request.body, {}];
	if (!reqData) {
		throw new APIError('sign: unknown_error', `系统未知错误`);
	}
	query[reqData.type] = reqData.id;
	//
	const userData = await User.aggregate([
		{
			$lookup: {
				from: 'usersInfo',
				localField: 'id',
				foreignField: 'id',
				as: 'userInfo',
			},
		},
		{
			$match: query,
		},
	])
		.then(docs => {
			console.log(docs);
			ctx.rest({
				avatar: docs[0].userInfo[0].avatar,
			});
		})
		.catch(err => {
			console.log(err);
			throw new APIError('sign: database_error', `系统未知错误`);
		});
};

const userInfo = async (ctx, next) => {
	const payload = getJWTPayload(ctx.headers.authorization);
	const userInfoData = await UserInfo.findOne({ id: payload.id })
		.then(docs => {
			ctx.rest({
				nickName: docs.nickName,
				avatar: docs.avatar,
				intro: docs.intro,
				sex: docs.sex,
				birthday: docs.birthday,
				region: docs.region,
			});
		})
		.catch(err => {
			throw new APIError('sign: unknown_error', `系统未知错误`);
		});
};

module.exports = {
	// 验证码
	'POST /api/user/sendCode': sendCode,
	// 头像
	'POST /api/user/userAvatar': userAvatar,
	// 注册
	'POST /api/user/signUp': signUp,
	// 登录
	'POST /api/user/signIn': signIn,
	// 登出
	'GET /api/user/signOut': signOut,
	// 信息
	'GET /api/user/userInfo': userInfo,
};
