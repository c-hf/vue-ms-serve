const jsonWebToken = require('../utils/jsonWebToken');
const websocketKit = require('../utils/websocketKit');
const UserInfo = require('../models/UserInfo');

// 初始化
const init = () => {
	io.on('connection', async socket => {
		console.log(`  --> SOCKET connection - Client.id: ${socket.id}`);
		try {
			const payload = jsonWebToken.getJWTPayload(
				`Bearer ${socket.handshake.query.token}`
			);

			const userInfo = await UserInfo.findOne({ userId: payload.userId });

			// join room
			socket.join(payload.userId);
			socket.join(userInfo.groupId);

			// 初始化信息
			if (userInfo.groupId.length) {
				await Promise.all([
					websocketKit
						.getDevices(userInfo.groupId, socket)
						.then(docs => {
							socket.emit('devices', docs);
						}),
					websocketKit.getGroup(userInfo.groupId).then(docs => {
						socket.emit('group', docs);
					}),
					websocketKit.getRooms(userInfo.groupId).then(docs => {
						socket.emit('rooms', docs.rooms);
					}),
				]);
			}

			// 未读消息数
			await websocketKit
				.getMessageUnreadNum(payload.userId)
				.then(docs => {
					socket.emit('message', {
						total: docs,
					});
				});

			// 断开连接
			socket.on('disconnect', reason => {
				console.log(
					`  --> SOCKET disconnect - Client.id: ${
						socket.id
					} (${reason})`
				);
			});

			// 错误处理
			socket.on('error', error => {
				console.log('SOCKET: ', error.message);
			});
		} catch (error) {
			console.log('SOCKET: ', error.message);
		}
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
		console.log(error.message);
		cb(null, false);
	}
};

module.exports = {
	init: init,
	allowRequest: allowRequest,
};
