const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const CitySchema = new Schema({
	adcode: String,
	name: String,
	city: [
		{
			citycode: String,
			adcode: String,
			name: String,
			center: String,
		},
	],
});

// 建立模型
const City = mongoose.model('City', CitySchema, 'city');

// 市
module.exports = City;
