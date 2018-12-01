// getId
module.exports = length => {
	// return Number(
	// 	Math.random()
	// 		.toString()
	// 		.substr(3, length) + Date.now()
	// ).toString(36);

	return Number(
		Math.random()
			.toString()
			.substr(3, 6) + Date.now()
	)
		.toString()
		.substr(Math.floor(Math.random() * 10), length);
};
