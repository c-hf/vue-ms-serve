const mongoose = require('mongoose');

module.exports = {
	init: () => {
		mongoose.connect(
			'mongodb://localhost:27017/koa',
			{ useNewUrlParser: true }
		);

		mongoose.connection.on(
			'error',
			console.error.bind(console, 'connection error:')
		);
		mongoose.connection.once('open', () => {
			// 连接成功
			console.log('connection successful...');
		});
	},
	mongoose: mongoose,
};
