const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const PowerSchema = new Schema({});

// 建立模型
const Power = mongoose.model('Power', PowerSchema, 'powers');

module.exports = Power;
