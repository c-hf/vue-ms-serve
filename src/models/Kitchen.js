const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const KitchenSchema = new Schema({});

// 建立模型
const Kitchen = mongoose.model('Kitchen', KitchenSchema, 'kitchens');

module.exports = Kitchen;
