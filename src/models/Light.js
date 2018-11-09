const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const LightSchema = new Schema({});

// 建立模型
const Light = mongoose.model('Light', LightSchema, 'lights');

module.exports = Light;
