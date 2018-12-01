const mqtt = require('mqtt');
const Device = require('../models/Device');
const DeviceStatus = require('../models/DeviceStatus');

// mqtt 初始化
const MQTTClientInit = () => {
	Device.find()
		.then(docs => {
			// console.log(docs);
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
const MQTTPublish = (groupId, deviceId, name) => {
	// 连接
	const client = mqtt.connect('mqtt://localhost:8000');

	//订阅主题
	client.subscribe(`${groupId}/${deviceId}`, { qos: 1 });

	// 获得消息回调
	client.on('message', (top, message) => {
		console.log(`device: ${name}`);
		updateStatus(groupId, deviceId, JSON.parse(message.toString()));
	});
};

// 更新数据库
const updateStatus = (groupId, deviceId, reqData) => {
	// console.log(reqData);
	const keys = Object.keys(reqData.reported);
	keys.forEach(el => {
		DeviceStatus.updateOne(
			{ deviceId: deviceId, 'attr.id': el },
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

module.exports = {
	// mqtt客户端 初始化
	MQTTClientInit: MQTTClientInit,
	// 订阅
	MQTTPublish: MQTTPublish,
};
