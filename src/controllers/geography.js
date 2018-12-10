const Province = require('../models/Province');
const City = require('../models/City');
const District = require('../models/District');

const APIError = require('../middleware/rest').APIError;

// 查找省
const getProvinceInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'user: get_province_info_unknown_error',
			`系统未知错误`
		);
	}

	await Province.find()
		.then(docs => {
			let resData = [];
			if (docs.length) {
				docs.forEach(el => {
					resData.push({
						value: el.adcode,
						label: el.name,
						children: [],
					});
				});
				resData.sort((a, b) => {
					const a_adcode = a.value;
					const b_adcode = b.value;
					return a_adcode - b_adcode;
				});
			}
			ctx.rest(resData);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// 查找市
const getCityInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError('user: get_city_info_unknown_error', `系统未知错误`);
	}

	await City.findOne({ adcode: reqData.adcode })
		.then(docs => {
			let resData = [];
			if (docs.city.length) {
				docs.city.forEach(el => {
					resData.push({
						value: el.adcode,
						label: el.name,
						children: [],
					});
				});
				resData.sort(ascendingOrder);
			}
			ctx.rest(resData);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// 查找县/区
const getDistrictInfo = async (ctx, next) => {
	const reqData = ctx.request.query;
	if (!reqData) {
		throw new APIError(
			'user: get_district_info_unknown_error',
			`系统未知错误`
		);
	}

	await District.findOne({ adcode: reqData.adcode })
		.then(docs => {
			let resData = [];
			if (docs.districts.length) {
				docs.districts.forEach(el => {
					resData.push({
						value: el.adcode,
						label: el.name,
					});
				});
				resData.sort(ascendingOrder);
			}
			ctx.rest(resData);
		})
		.catch(error => {
			console.log(error);
			throw new APIError('user: database_error', `系统未知错误`);
		});
};

// 升序排序
const ascendingOrder = (a, b) => {
	const a_adcode = a.value;
	const b_adcode = b.value;
	return a_adcode - b_adcode;
};

module.exports = {
	// 查找省
	'GET /api/user/getProvinceInfo': getProvinceInfo,
	// 查找市
	'GET /api/user/getCityInfo': getCityInfo,
	// 查找县/区
	'GET /api/user/getDistrictInfo': getDistrictInfo,
};
