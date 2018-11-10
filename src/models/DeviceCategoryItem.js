const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const deviceCategoryItemSchema = new Schema({
	categoryId: String,
	categoryItemId: String,
	name: String,
});

// 建立模型
const DeviceCategoryItem = mongoose.model(
	'DeviceCategoryItem',
	deviceCategoryItemSchema,
	'deviceCategoryItems'
);

// 设备分类项
module.exports = DeviceCategoryItem;
