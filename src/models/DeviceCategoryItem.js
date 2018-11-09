const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const deviceCategoryItemSchema = new Schema({
	categoryId: String,
	categoryItemId: String,
	name: String,
	param: [
		{
			id: String,
			name: String,
			value: String,
			unit: String,
		},
	],
	attr: [
		{
			id: String,
			name: String,
			type: String,
			attr: String,
			unit: String,
		},
	],
});

// 建立模型
const DeviceCategoryItem = mongoose.model(
	'DeviceCategoryItem',
	deviceCategoryItemSchema,
	'deviceCategoryItems'
);

module.exports = DeviceCategoryItem;
