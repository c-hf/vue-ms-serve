const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const deviceAttrSchema = new Schema({
	categoryItemId: String,
	attr: [
		{
			id: String,
			name: String,
			attrType: String,
			value: String,
			unit: String,
		},
	],
});

// 建立模型
const DeviceAttr = mongoose.model(
	'DeviceAttr',
	deviceAttrSchema,
	'deviceAttrs'
);

// 设备属性
module.exports = DeviceAttr;
