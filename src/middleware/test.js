const WebSocket = require('ws'); // websocket Serve
const jsonWebToken = require('../utils/jsonWebToken');

let wss;

const clients = {};


const connection = (ws, req) => {
	const ip = req.connection.remoteAddress;
	console.log(ip);
	const payload = jsonWebToken.getJWTPayload(`Bearer ${ws.protocol}`);
	// console.log(payload);

	if (!payload.groupId) {
		ws.close(4001, 'Invalid user');
	}

	if (clients[payload.groupId]) {
		clients[payload.groupId].push(ws);
	} else {
		clients[payload.groupId] = [ws];
	}


	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

};

// 创建 WebSocketServer:
const wssInit = server => {
	wss = new WebSocket.Server({ server });
	wss.on('connection', connection);
};

module.exports = wssInit;
