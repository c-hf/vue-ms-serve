const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const DistrictSchema = new Schema({
	citycode: String,
	adcode: String,
	name: String,
	districts: [
		{
			citycode: String,
			adcode: String,
			name: String,
			center: String,
		},
	],
});

// 建立模型
const District = mongoose.model('District', DistrictSchema, 'district');

// 市
module.exports = District;
