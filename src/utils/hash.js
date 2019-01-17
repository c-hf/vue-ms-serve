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

	hmacDevideId: id => {
		const hash = crypto.createHash('md5');
		const currentTime = new Date().getTime().toString();

		hash.update(currentTime);
		hash.update(id);

		return hash.digest('hex');
	},
};
