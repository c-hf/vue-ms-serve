const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const ProvinceSchema = new Schema({
	adcode: String,
	name: String,
	center: String,
});

// 建立模型
const Province = mongoose.model('Province', ProvinceSchema, 'province');

// 省
module.exports = Province;
