const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/koa');

// const db = mongoose.connection;

mongoose.connection.on(
	'error',
	console.error.bind(console, 'connection error:')
);
mongoose.connection.once('open', () => {
	// 连接成功
	console.log('connection successful...');
});

module.exports = mongoose;
