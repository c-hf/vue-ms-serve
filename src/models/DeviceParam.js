const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceParamSchema = new Schema({
	categoryItemId: String,
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
const DeviceParam = mongoose.model(
	'DeviceParam',
	deviceParamSchema,
	'deviceParams'
);

// 设备参数
module.exports = DeviceParam;
