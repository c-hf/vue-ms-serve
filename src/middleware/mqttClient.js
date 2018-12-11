const mqtt = require('mqtt');
const Device = require('../models/Device');

// mqtt 初始化
const MQTTClientInit = () => {
	Device.find()
		.then(docs => {
			docs.forEach(el => {
				mqttPublish(el.groupId, el.deviceId, el.name);
			});

			console.log('MQTT Init Success...');
		})
		.catch(error => {
			console.log(`MQTT: ${error}`);
		});
};

// 订阅
const MQTTSubscribe = (groupId, deviceId, name) => {
	// 连接
	const client = mqtt.connect('mqtt://localhost:8000');

	//订阅主题
	client.subscribe(`device/desired/${groupId}/${deviceId}`, { qos: 1 });

	// 获得消息回调
	client.on('message', (top, message) => {
		console.log(`device: ${name}`);
		console.log(JSON.parse(message.toString()));
	});
};

// 发布
const MQTTPublish = (groupId, deviceId, data) => {
	const client = mqtt.connect('mqtt://localhost:8000');
	client.on('connect', () => {
		client.publish(
			`device/desired/${groupId}/${deviceId}`,
			JSON.stringify(data),
			{
				qos: 1,
				retain: true,
			}
		);
		client.end();
	});
};

module.exports = {
	// mqtt客户端 初始化
	MQTTClientInit: MQTTClientInit,
	// 订阅
	MQTTPublish: MQTTPublish,
	// 发布
	MQTTSubscribe: MQTTSubscribe,
};
