const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/index').jwtSecret; // jwt密钥
const expiresIn = require('../config/index').expiresIn; // 有效时间

module.exports = {
	getToken: (content = {}) => {
		return jwt.sign(content, jwtSecret, { expiresIn: expiresIn });
	},
	// 解析JWT
	getJWTPayload: token => {
		return jwt.verify(token.split(' ')[1], jwtSecret);
	},
};
