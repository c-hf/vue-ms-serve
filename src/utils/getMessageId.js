// 消息ID
module.exports = () => {
	return (
		Math.random()
			.toString(36)
			.substr(2) + Date.now().toString()
	).substr(0, 20);
};
