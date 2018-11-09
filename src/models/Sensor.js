const mongoose = require('../middleware/db');
const Schema = mongoose.Schema;

// 定义schema
const SensorSchema = new Schema({});

// 建立模型
const Sensor = mongoose.model('Sensor', SensorSchema, 'sensors');

module.exports = Sensor;
