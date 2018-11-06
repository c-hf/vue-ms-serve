module.exports = {
	APIError: function(code, message) {
		this.code = code || 'internal:unknown_error';
		this.message = message || '系统未知错误';
	},
	restify: (pathPrefix = '/api/') => {
		return async (ctx, next) => {
			if (ctx.request.path.startsWith(pathPrefix)) {
				// console.log(
				// 	`Process API ${ctx.request.method} ${ctx.request.url}...`
				// );
				ctx.rest = data => {
					// 等同于 ctx.set('Content-Type', 'application/json; charset=utf-8');
					ctx.response.type = 'application/json';
					ctx.response.body = data;
				};
				await next();
				// try {
				// 	await next();
				// } catch (e) {
				// 	console.log(
				// 		`--- Process API ${ctx.request.method} ${
				// 			ctx.request.url
				// 		} error (${e.code})...`
				// 	);
				// 	ctx.response.status = 200;
				// 	ctx.response.type = 'application/json';
				// 	ctx.response.body = {
				// 		code: e.code || 'internal: unknown_error',
				// 		message: e.message || '系统未知错误',
				// 	};
				// }
			} else {
				await next();
			}
		};
	},
};
