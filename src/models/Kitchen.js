const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const KitchenSchema = new Schema({});

// 建立模型
const Kitchen = mongoose.model('Kitchen', KitchenSchema, 'kitchens');

// 厨房电器设备
module.exports = Kitchen;
