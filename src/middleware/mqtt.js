const mosca = require('mosca');
const mqttClient = require('./mqttClient');
const mqttKit = require('../utils/mqttKit');

const settings = {
	http: {
		port: 8000,
		bundle: true,
		static: './mqtt/',
	},
};

const server = new mosca.Server(settings);

// 用户名与密码 验证
const authenticate = (client, username, password, callback) => {
	let authorized = username === 'test' && password.toString() === 'test';
	console.log(`---> username: ${username} ---> password: ${password}`);
	if (authorized) client.user = username;
	callback(null, authorized);
};

const mqttserver = () => {
	// connected
	server.on('clientConnected', client => {
		if (!client.id.startsWith('mqttjs')) {
			mqttKit.setOnline(client.id, true);
		}
	});

	// pub
	server.on('published', async (packet, client) => {
		try {
			console.log(`  --> published : ${packet.payload}`);

			if (packet.topic.startsWith('device/status/')) {
				const payload = JSON.parse(packet.payload.toString());
				await Promise.all([
					mqttKit.updateStatus(client.id, payload.reported),
					mqttKit.setDeviceAssociate(client.id, payload.reported),
				]);
			}
		} catch (error) {
			console.log(`MQTT: ${error}`);
		}
	});

	// disconnected
	server.on('clientDisconnected', client => {
		// console.log('clientDisconnected : ', client.id);
		if (!client.id.startsWith('mqttjs')) {
			mqttKit.setOnline(client.id, false);
		}
	});

	// ready
	server.on('ready', () => {
		// server.authenticate = authenticate;
		console.log('MQTT is running...');
	});
};

module.exports = {
	server: mqttserver,
};
