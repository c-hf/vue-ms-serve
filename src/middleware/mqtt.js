const mosca = require('mosca');
const Device = require('../models/Device');
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
const updateStatus = async reqData => {
	const keys = Object.keys(reqData.reported);
	await keys.forEach(el => {
		DeviceStatus.updateOne(
			{ deviceId: reqData.requestId, 'attr.id': el },
			{
				$set: {
					'attr.$': { id: el, value: reqData.reported[el] },
				},
			}
		).catch(error => {
			console.log(`MQTT_database_error: ${error}`);
		});
	});
};

const setOnline = (deviceId, online) => {
	return Promise.all([
		DeviceStatus.updateOne({ deviceId: deviceId }, { online: online }),
		Device.findOne({ deviceId: deviceId }),
	])
		.then(docs => {
			if (!docs) {
				return;
			}
			io.to(docs[1].groupId).emit('updateOnline', {
				deviceId: deviceId,
				online: online,
			});
		})
		.catch(error => {
			console.log(`MQTT_database_error: ${error}`);
		});
};

const server = () => {
	// 客户端连接时回调
	MqttServer.on('clientConnected', client => {
		setOnline(client.id, true);
		console.log(`  --> mqtt-client connected: ${client.id}`);
	});

	// 发布时回调
	MqttServer.on('published', (packet, client) => {
		try {
			console.log(`  --> published : ${packet.payload}`);
			console.log(packet.topic.startsWith === 'device/update/');
			if (packet.topic.startsWith === 'device/update/') {
				console.log(packet.topic);
				console.log(client.id);
				const payload = JSON.parse(packet.payload.toString());
				const keys = Object.keys(payload.reported);
				let status = [];
				keys.forEach(el => {
					status.push({
						id: el,
						value: payload.reported[el],
					});
				});
				if (payload.requestId) {
					updateStatus(payload).then(() => {});
				}
			}
			// if (typeof packet.payload === 'object') {

			// }
		} catch (error) {
			console.log(`MQTT: ${error}`);
		}
	});

	MqttServer.on('clientDisconnecting', client => {
		console.log('clientDisconnecting : ', client.id);
	});

	// 断开连接
	MqttServer.on('clientDisconnected', client => {
		setOnline(client.id, false);
		console.log('clientDisconnected : ', client.id);
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
