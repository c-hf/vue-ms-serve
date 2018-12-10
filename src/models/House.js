const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const HouseSchema = new Schema({
	groupId: String,
	rooms: [
		{
			roomId: String,
			name: String,
			icon: String,
		},
	],
});

// 建立模型
const House = mongoose.model('House', HouseSchema, 'houses');

// 市
module.exports = House;
