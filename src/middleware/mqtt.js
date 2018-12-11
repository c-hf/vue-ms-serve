const mosca = require('mosca');
const mqttClient = require('./mqttClient');
const mqttKit = require('../utils/mqttKit');

const MqttServer = new mosca.Server({
	port: 8000,
});

// 用户名与密码有效，接受链接
const authenticate = (client, username, password, callback) => {
	let authorized = username === 'test' && password.toString() === 'test';
	console.log(`---> username: ${username} ---> password: ${password}`);
	if (authorized) client.user = username;
	callback(null, authorized);
};

const server = () => {
	// 客户端连接时回调
	MqttServer.on('clientConnected', client => {
		mqttKit.setOnline(client.id, true);
		// console.log(`  --> mqtt-client connected: ${client.id}`);
	});

	// 发布时回调
	MqttServer.on('published', (packet, client) => {
		try {
			console.log(`  --> published : ${packet.payload}`);
			// console.log(packet.topic);
			// console.log(client.id);
			if (packet.topic.startsWith('device/status/')) {
				const payload = JSON.parse(packet.payload.toString());
				const keys = Object.keys(payload.reported);
				let status = [];
				keys.forEach(el => {
					status.push({
						id: el,
						value: payload.reported[el],
					});
				});
				mqttKit.updateStatus(client.id, status);
			}
		} catch (error) {
			console.log(`MQTT: ${error}`);
		}
	});

	MqttServer.on('clientDisconnecting', client => {
		console.log('clientDisconnecting : ', client.id);
	});

	// 断开连接
	MqttServer.on('clientDisconnected', client => {
		mqttKit.setOnline(client.id, false);
		// console.log('clientDisconnected : ', client.id);
	});

	MqttServer.on('ready', () => {
		// MqttServer.authenticate = authenticate;
		console.log('MQTT is running...');
	});
};

// MqttServer 初始化
module.exports = {
	server: server,
};
