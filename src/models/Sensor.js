const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const SensorSchema = new Schema({});

// 建立模型
const Sensor = mongoose.model('Sensor', SensorSchema, 'sensors');

// 传感器设备
module.exports = Sensor;
