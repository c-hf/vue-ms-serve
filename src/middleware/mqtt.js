const mosca = require('mosca');
const DeviceStatus = require('../models/DeviceStatus');

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

// 更新数据库
const updateStatus = reqData => {
	// console.log(reqData);
	const keys = Object.keys(reqData.reported);
	keys.forEach(el => {
		DeviceStatus.updateOne(
			{ deviceId: reqData.requestId, 'attr.id': el },
			{
				$set: {
					'attr.$': { id: el, value: reqData.reported[el] },
				},
			}
		)
			.then(docs => {
				// console.log(docs);
			})
			.catch(error => {
				console.log(`MQTT_Data: ${error}`);
			});
	});
};

const server = () => {
	// 客户端连接时回调
	MqttServer.on('clientConnected', client => {
		console.log(`---> client connected: ${client.id}`);
	});

	// 发布时回调
	MqttServer.on('published', (packet, client) => {
		// console.log(`---> published : ${packet.payload}`);

		if (typeof packet.payload === 'object') {
			const payload = JSON.parse(packet.payload.toString());
			if (payload.requestId) {
				updateStatus(payload);
			}
		}
	});

	MqttServer.on('ready', () => {
		// MqttServer.authenticate = authenticate;
		console.log('mqtt is running....');
	});
};

// MqttServer 初始化
module.exports = {
	server: server,
};
