// 查询 Collection 所有数据
module.exports.findAllCollection = collection => {
	return collection.find({}, (err, doc) => {
		if (err) {
			console.log(err);
			return;
		}
	});
};

// 向 Collection 增加数据
// module.exports.addData = data => {
// 	if (!data) {
// 		return;
// 	}
// 	data.save(err => {
// 		if (err) {
// 			console.log(err);
// 			return;
// 		}
// 	});
// 	return data;
// };

// 查询 Collection 特定 id 数据
// module.exports.findFilterCollection = async (collection, key, value) => {
// 	if (!key || value) {
// 		return;
// 	}
// 	let res = [];
// 	await collection.findOne({ key: value }, (err, doc) => {
// 		if (err) {
// 			console.log(err);
// 			return;
// 		}
// 		res = doc;
// 	});
// 	return res;
// };
