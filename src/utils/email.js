const nodemailer = require('nodemailer');
// 配置
const config = require('../config/index').nodemailer;
// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);
const APIError = require('../middleware/rest').APIError;

// 发送邮件
module.exports = mail => {
	return new Promise((resolve, reject) => {
		transporter.sendMail(mail, (error, info) => {
			if (error) {
				reject(error);
			}
			resolve(info);
		});
	}).catch(error => {
		console.log(error);
		throw new APIError('sign: e-mail_sending_failed', '邮箱验证码发送失败');
	});
};
