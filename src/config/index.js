module.exports = {
	jwtSecret: 'chf',
	staticPath: '/src/assets',
	nodemailer: {
		host: 'smtp.qq.com',
		secureConnection: true, // use SSL
		port: 465,
		secure: true, // secure:true for port 465, secure:false for port 587
		auth: {
			user: '825931062@qq.com',
			pass: 'fruulubmyywbbcge',
		},
	},
	mail: {
		// 发件人
		from: 'chfeng.top<825931062@qq.com>',
		// 收件人
		to: '',
		// 主题
		subject: '',
		// html: '',
		html: '',
	},
};
