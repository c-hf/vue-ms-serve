const crypto = require('crypto');

module.exports = {
	// id
	hashId: id => {
		let hashId = crypto.createHash('md5');
		hashId.update(id);
		return hashId.digest('hex');
	},
	// password
	hmacPassWord: (jwToken, password) => {
		const hmacSecret = jwToken;
		let hmacPassWord = crypto.createHmac('sha256', hmacSecret);
		hmacPassWord.update(password);
		return hmacPassWord.digest('hex');
	},
};
