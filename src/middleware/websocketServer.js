const jsonWebToken = require('../utils/jsonWebToken');
const websocketKit = require('../utils/websocketKit');

// });
// 初始化
const init = () => {
	io.on('connection', socket => {
		console.log(`  --> SOCKET connection - Client.id: ${socket.id}`);
		const payload = jsonWebToken.getJWTPayload(
			`Bearer ${socket.request._query.token}`
		);
		if (payload.groupId.length) {
			websocketKit.getDevices(payload.groupId, socket).then(docs => {
				socket.emit('deviceList', docs);
			});
			websocketKit.getRooms(payload.groupId).then(docs => {
				socket.emit('rooms', docs.rooms);
			});
		}

		// join room
		socket.join(payload.groupId);

		// 断开连接
		socket.on('disconnect', reason => {
			console.log(
				`  --> SOCKET disconnect - Client.id: ${socket.id} (${reason})`
			);
		});

		// 发生错误
		socket.on('error', error => {
			console.log(error);
		});
	});
};

// 连接验证
const allowRequest = (req, cb) => {
	console.log('  --> SOCKET request...');
	try {
		if (!req._query) {
			return cb(null, false);
		}
		const payload = jsonWebToken.getJWTPayload(
			`Bearer ${req._query.token}`
		);
		payload.userId.length ? cb(null, true) : cb(null, false);
	} catch (error) {
		console.log(error);
		cb(null, false);
	}
};

module.exports = {
	init: init,
	allowRequest: allowRequest,
};
