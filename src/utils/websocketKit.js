const Device = require('../models/Device');
const UserGroup = require('../models/UserGroup');
const House = require('../models/House');
const MessageRelation = require('../models/MessageRelation');

// 获取设备信息
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
			$lookup: {
				from: 'deviceCategorys',
				localField: 'categoryItemInfo.categoryId',
				foreignField: 'categoryId',
				as: 'categoryInfo',
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
		{
			$unwind: {
				path: '$categoryInfo',
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
						categoryId: el.categoryInfo.categoryId,
						categoryName: el.categoryInfo.name,
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
			console.log('websocketKit: ', error.message);
		});
};

// 获取房间信息
const getRooms = groupId => {
	return House.findOne({ groupId: groupId })
		.then(docs => {
			if (docs.rooms.length) {
				return docs;
			}
		})
		.catch(error => {
			console.log('websocketKit: ', error.message);
		});
};

// 获取群组信息
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
			console.log('websocketKit: ', error.message);
		});
};

// 获取未读消息数
const getMessageUnreadNum = async userId => {
	const total = await MessageRelation.find({
		userId: userId,
		status: 'UNREAD',
	}).countDocuments();

	return total;
};

module.exports = {
	getDevices: getDevices,
	getRooms: getRooms,
	getGroup: getGroup,
	getMessageUnreadNum: getMessageUnreadNum,
};
