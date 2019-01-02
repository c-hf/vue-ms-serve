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
				as: 'statusInfo',
			},
		},
		{
			$lookup: {
				from: 'deviceCategoryItems',
				localField: 'categoryItemId',
				foreignField: 'categoryItemId',
				as: 'categoryItemInfo',
			},
		},
		{
			$unwind: {
				path: '$statusInfo',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$unwind: {
				path: '$categoryItemInfo',
				preserveNullAndEmptyArrays: true,
			},
		},
	])
		.then(docs => {
			const resData = [];
			docs.forEach(el => {
				resData.push({
					device: {
						groupId: el.groupId,
						roomId: el.roomId,
						deviceId: el.deviceId,
						categoryId: el.categoryItemInfo.categoryId,
						categoryItemId: el.categoryItemId,
						categoryItemName: el.categoryItemInfo.name,
						name: el.name,
						desc: el.desc,
						networking: el.networking,
						os: el.os,
						protocol: el.protocol,
						onLine: el.statusInfo.onLine,
						createTime: el.createTime,
						updateTime: el.statusInfo.updateTime,
					},
					status: el.statusInfo.status,
				});
			});
			return resData;
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

const getGroup = groupId => {
	return UserGroup.findOne({ groupId: groupId })
		.then(docs => {
			if (docs.groupId.length) {
				const resData = {
					groupId: docs.groupId,
					ownerId: docs.ownerId,
					groupName: docs.groupName,
					member: docs.member,
					region: docs.region,
					createTime: docs.createTime,
				};

				return resData;
			}
			return;
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
	getGroup: getGroup,
};
