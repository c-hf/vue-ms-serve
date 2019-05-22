const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const ModeSchema = new Schema(
	{
		modeId: String,
		groupId: String,
		name: String, // 名称
		content: Array, // TaskId
		timeType: Number, // 0 不定时 1 执行一次 2 每周执行
		time: String, // 定时时间
		date: Array,
		switch: Boolean,
		perform: Boolean, // 是否执行
		finish: Boolean, // 是否完成
		createTime: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: { createdAt: 'createTime' },
	}
);

// 建立模型
const Mode = mongoose.model('Mode', ModeSchema, 'modes');

// 设备参数
module.exports = Mode;
