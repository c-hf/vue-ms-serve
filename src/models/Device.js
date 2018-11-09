const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const DeviceSchema = new Schema({
	id: String,
	categoryItemId: String,
	DeviceId: String,
	name: String,
	describe: String,
	os: String,
	networking: String,
	protocol: String,
	param: [
		{
			id: String,
			name: String,
			value: String,
			unit: String,
		},
	],
});

// 建立模型
const Device = mongoose.model('Device', DeviceSchema, 'devices');

module.exports = Device;
