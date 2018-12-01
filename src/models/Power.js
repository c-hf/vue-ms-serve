const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const PowerSchema = new Schema({});

// 建立模型
const Power = mongoose.model('Power', PowerSchema, 'powers');

// 电源开关设备
module.exports = Power;
