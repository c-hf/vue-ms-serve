const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/index').jwtSecret; // jwt密钥

module.exports = {
	getToken: (content = {}) => {
		return jwt.sign(content, jwtSecret, { expiresIn: 60 * 60 * 1 });
	},
	// 解析JWT
	getJWTPayload: token => {
		return jwt.verify(token.split(' ')[1], jwtSecret);
	},
};
