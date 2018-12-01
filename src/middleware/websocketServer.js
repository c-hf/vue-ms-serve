const Server = require('socket.io');
let io = null;

const init = server => {
	io = new Server(server, {
		allowRequest: (req, cb) => {
			// if (req._query && req._query.token === 'abc') return cb(null, true);
			// cb(null, false);
			console.log(req._query);
			return cb(null, true);
		},
	});

	io.on('connection', socket => {
		console.log('已连接');

		// console.log(socket);
		// 断开连接
		socket.on('disconnect', reason => {
			console.log(reason);
		});
	});
};

module.exports = {
	init: init,
	io: io,
};
