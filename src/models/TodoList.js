const mongoose = require('../middleware/mongoose').mongoose;
const Schema = mongoose.Schema;

// 定义schema
const TodoListSchema = new Schema(
	{
		userId: String,
		todoId: String,
		todoType: Number,
		content: String, // 事项内容
		time: String, // 时间
		finish: Boolean, // 是否完成
		createTime: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
	}
);

// 建立模型
const TodoList = mongoose.model('TodoList', TodoListSchema, 'TodoList');

// 待做事项
module.exports = TodoList;
