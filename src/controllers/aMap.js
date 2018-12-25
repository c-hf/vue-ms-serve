const request = require('request');
const APIError = require('../middleware/rest').APIError;

// 天气查询
const getWeatherInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('aMap: unknown_error', `系统未知错误`);
	}

	const resData = await getWeather(reqData.city).catch(error => {
		console.log(error);
		throw new APIError('weChat: unknown_error', `系统未知错误`);
	});

	ctx.rest(resData);
};

const getWeather = city => {
	return new Promise((resolve, reject) => {
		const key = 'dbbe632a2fd8f1e371cbb6b947323f5e';
		let url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${key}`;
		request(url, (error, response, body) => {
			if (error) reject(error);
			resolve(JSON.parse(body));
		});
	});
};

module.exports = {
	// 天气查询
	'GET /api/aMap/getWeatherInfo': getWeatherInfo,
};
