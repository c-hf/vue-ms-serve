const House = require('../models/House');
const Device = require('../models/Device');
const DeviceStatus = require('../models/DeviceStatus');
const DeviceAttr = require('../models/DeviceAttr');
const identifyOperation = require('../utils/identifyOperation');
const mqttClient = require('../middleware/mqttClient');
const APIError = require('../middleware/rest').APIError;
const getJWTPayload = require('../utils/jsonWebToken').getJWTPayload;
const setSemanticText = async (ctx, next) => {
	const [payload, reqData] = [
		getJWTPayload(ctx.headers.authorization),
		ctx.request.body,
	];
	if (!reqData) {
		throw new APIError(
			'device: update_device_profile_unknown_error',
			`系统未知错误`
		);
	}

	let order = identifyOperation.identifyOpenOperation(reqData.text);
	let groupId = payload.groupId; //可以从token里得到
	let positionName = order.position;
	let deviceName = order.metric;
	let action = order.action;
	let roomId = '';
	//判断order是否完整
	if (order.position === '' || order.metric === '' || order.action === '') {
		ctx.rest({
			information: '系统无法识别',
			data: '',
		});
		return;
	}
	//通过 groupId查找用户房间名对应的roomId
	await House.find(
		{ groupId: groupId, 'rooms.name': positionName },
		{ 'rooms.name': 1, 'rooms.roomId': 2 }
	)
		.then(docs => {
			docs[0].rooms.forEach((value, index) => {
				if (value.name === positionName) {
					roomId = value.roomId;
				}
			});
		})
		.catch(error => {
			ctx.rest({
				information: '系统无法识别',
				data: '',
			});
		});
	//通过 groupId,roomId,设备类型名字查找设备对应的deviceId,可能唯一或者有多个
	await Device.aggregate([
		{
			$lookup: {
				from: 'deviceStatus',
				localField: 'deviceId',
				foreignField: 'deviceId',
				as: 'deviceStatus',
			},
		},
		{ $match: { groupId: groupId, roomId: roomId, name: deviceName } },
	])
		.then(docs => {
			//如果存在存在deviceId属性,并且该房间该类设备个数为1
			if (docs.length === 1) {
				//发布到mqtt
				//如果设备在线
				if (docs[0].deviceStatus[0].onLine === true) {
					try {
						let deviceIdAggregate = [];
						deviceIdAggregate.push(
							docs[0].deviceStatus[0].deviceId
						);
						mqttClient.MQTTPublish(
							groupId,
							docs[0].deviceStatus[0].deviceId,
							action
						);
						ctx.rest({
							information: '操作已完成',
							data: deviceIdAggregate,
						});
					} catch (error) {
						console.log(error);
					}
				} else {
					//告诉用户该房间的设备不在线
					ctx.rest({
						information: '设备不在线',
						data: [],
					});
				}
			} else if (docs.length > 1) {
				let deviceIdAggregate = []; //用于存放查找出来的设备id
				let deviceStatus = []; //用于存储用户设备是否在线(不是是否开关)
				let deviceName = [];
				docs.forEach((value, index) => {
					if (value.deviceStatus[0].onLine == true) {
						deviceStatus.push(value.deviceStatus[0].onLine);
						deviceIdAggregate.push(value.deviceStatus[0].deviceId);
						deviceName.push(order.metric);
					}
				});
				//返回给用户选择，包括是否在线的设备
				//返回的数据包括:该房间所拥有该类设备的deviceId,和要操作的动作
				// console.log(deviceIdAggregate);
				if (deviceIdAggregate.length === 0) {
					ctx.rest({
						information: '设备均不在线',
						data: deviceIdAggregate,
						status: deviceStatus,
					});
				}
				if (deviceIdAggregate.length === 1) {
					mqttClient.MQTTPublish(
						groupId,
						docs[0].deviceStatus[0].deviceId,
						action
					);
					ctx.rest({
						information: '操作已完成',
						data: deviceIdAggregate,
					});
				} else {
					ctx.rest({
						data: deviceIdAggregate,
						status: deviceStatus,
						action: action,
						name: deviceName,
					});
				} 
			} else if (docs.length === 0) {
				ctx.rest({
					information: '设备均不存在',
					data: [],
				});
				scrollY;
			}
		})
		.catch(error => {
			ctx.rest({
				information: '系统无法识别',
				data: '',
			});
		});
};
module.exports = {
	//设置语义文本
	'POST /api/semantic/setSemanticText': setSemanticText,
};
