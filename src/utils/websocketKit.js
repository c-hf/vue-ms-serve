const Device = require('../models/Device');
const UserGroup = require('../models/UserGroup');
const UserInfo = require('../models/UserInfo');
const House = require('../models/House');

// userInfo 添加 io
const pushIo = () => {
	UserInfo.updateOne(
		{
			userId: payload.userId,
		},
		{
			$push: {
				ioId: socket.id,
			},
		}
	).catch(error => {
		console.log(error);
	});
};

// userInfo 删除 io
const pullIo = () => {
	UserInfo.updateOne(
		{
			userId: payload.userId,
		},
		{
			$pull: {
				ioId: socket.id,
			},
		}
	).catch(error => {
		console.log(error);
	});
};

const getDevices = groupId => {
	return Device.aggregate([
		{
			$match: { groupId: groupId },
		},
		{
			$lookup: {
				from: 'deviceStatus',
				localField: 'deviceId',
				foreignField: 'deviceId',
				as: 'statusData',
			},
		},
		{
			$unwind: {
				path: '$statusData',
				preserveNullAndEmptyArrays: true,
			},
		},
	])
		.then(docs => {
			const deviceData = [];
			docs.forEach(el => {
				deviceData.push({
					groupId: el.groupId,
					categoryItemId: el.categoryItemId,
					deviceId: el.deviceId,
					roomId: el.roomId,
					name: el.name,
					desc: el.desc,
					networking: el.networking,
					os: el.os,
					protocol: el.protocol,
					onLine: el.statusData.onLine,
					status: el.statusData.status,
					createTime: el.createTime,
					updateTime: el.statusData.updateTime,
				});
			});
			return deviceData;
		})
		.catch(error => {
			console.log(error);
		});
};

const getRooms = groupId => {
	return House.findOne({ groupId: groupId })
		.then(docs => {
			if (docs.rooms.length) {
				return docs;
			}
		})
		.catch(error => {
			console.log(error);
		});
};

module.exports = {
	pushIo: pushIo,
	pullIo: pullIo,
	getDevices: getDevices,
	getRooms: getRooms,
};
