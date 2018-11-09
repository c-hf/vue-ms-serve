const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const EnvironmentSchema = new Schema({});

// 建立模型
const Environment = mongoose.model(
	'Environment',
	KitchenSchema,
	'environments'
);

module.exports = Environment;
