const fs = require('fs');

// add url-route in /controllers:

const addMapping = (router, mapping) => {
	for (let url in mapping) {
		if (url.startsWith('GET ')) {
			let path = url.substring(4);
			router.get(path, mapping[url]);
			console.log(`register URL mapping: GET ${path}`);
		} else if (url.startsWith('POST ')) {
			let path = url.substring(5);
			router.post(path, mapping[url]);
			console.log(`register URL mapping: POST ${path}`);
		} else if (url.startsWith('PUT ')) {
			let path = url.substring(4);
			router.put(path, mapping[url]);
			console.log(`register URL mapping: PUT ${path}`);
		} else if (url.startsWith('DELETE ')) {
			let path = url.substring(7);
			router.del(path, mapping[url]);
			console.log(`register URL mapping: DELETE ${path}`);
		} else {
			console.log(`invalid URL: ${url}`);
		}
	}
};

// 获取 dir 目录的中的文件名
// 取出文件后缀为 .js 的文件
// 加载模块
// 调用 addMapping() 设置路由
const addControllers = (router, dir) => {
	fs.readdirSync(__dirname + '/' + dir)
		.filter(f => {
			return f.endsWith('.js');
		})
		.forEach(f => {
			console.log(`process controller: ${f}...`);
			let mapping = require(__dirname + '/' + dir + '/' + f);
			addMapping(router, mapping);
		});
};

module.exports = dir => {
	let controllers_dir = dir || '../controllers',
		router = require('koa-router')();
	addControllers(router, controllers_dir);
	return router.routes();
};
