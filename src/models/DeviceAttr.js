const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const deviceAttrSchema = new Schema({
	categoryItemId: String,
	attr: [Object],
});

// 建立模型
const DeviceAttr = mongoose.model(
	'DeviceAttr',
	deviceAttrSchema,
	'deviceAttrs'
);

// 设备属性
module.exports = DeviceAttr;
