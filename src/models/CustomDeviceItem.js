const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceSchema = new Schema({
	userId: String,
	deviceId: String,
	name: String,
});

// 建立模型
const Device = mongoose.model('Device', deviceSchema, 'devices');

// 自定义设备
module.exports = Device;
