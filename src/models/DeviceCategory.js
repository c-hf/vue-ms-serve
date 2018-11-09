const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const deviceCategorySchema = new Schema({
	categoryId: String,
	name: String,
});

// 建立模型
const DeviceCategory = mongoose.model(
	'DeviceCategory',
	deviceCategorySchema,
	'deviceCategorys'
);

module.exports = DeviceCategory;
