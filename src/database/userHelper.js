const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const VerificationCode = require('../models/VerificationCode');

// User

// 查询 users 集合特定 属性 数据
module.exports.findFilterUser = async query => {
	if (!query) {
		return;
	}
	return User.findOne(query, err => {
		if (err) {
			console.log(err);
			return;
		}
	});
};

// 删除用户
module.exports.deleteUser = query => {
	if (!query) {
		return;
	}
	return User.deleteOne(query, (err, result) => {
		if (err) {
			console.log(err);
			return;
		}
		res = result;
	});
};

// UserInfo

// 查询 UserInfo 集合特定数据
module.exports.findFilterUserInfo = query => {
	if (!query) {
		return;
	}

	return UserInfo.findOne(query, (err, doc) => {
		if (err) {
			console.log(err);
			return;
		}
	});
};

// VerificationCode

// 查询 VerificationCode 集合特定 属性 数据
module.exports.findFilterVerificationCode = query => {
	if (!query) {
		return;
	}
	return VerificationCode.findOne(query, (err, doc) => {
		if (err) {
			console.log(err);
			return;
		}
	});
};

// 删除过期验证码
module.exports.deleteCode = query => {
	if (!query) {
		return;
	}
	return VerificationCode.deleteOne(query, (err, result) => {
		if (err) {
			console.log(err);
			return;
		}
	});
};
