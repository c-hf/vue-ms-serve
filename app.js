const Koa = require('koa'); // Koa
const cors = require('koa2-cors'); // cors 跨域
const jwtKoa = require('koa-jwt'); // koa-jwt
const logger = require('koa-logger'); // log
const static = require('koa-static'); // 静态资源服务
const koaBody = require('koa-body'); // koa-body 使用ctx.body解析中间件

// controller
const controller = require('./src/middleware/controller');
// REST API
const rest = require('./src/middleware/rest');
// 重新签发令牌
const reIssueToken = require('./src/middleware/reIssueToken');
// mongoose
const mongoose = require('./src/middleware/mongoose');
// mqtt
const mqtt = require('./src/middleware/mqtt');
// wss
const wss = require('./src/middleware/websocketServer');
// jwt密钥
const jwtSecret = require('./src/config/index').jwtSecret;
// 静态资源的路径
const staticPath = require('./src/config/index').staticPath;

const app = new Koa();

// log
app.use(logger());

// koa 跨域请求
app.use(
	cors({
		origin: '*',
		exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
		maxAge: 600,
		credentials: true,
		allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
		allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
	})
);

// 静态资源服务器
app.use(static(__dirname + staticPath));

// token 验证异常时候的处理，如过期、错误
app.use((ctx, next) => {
	return next().catch(error => {
		// console.log(error);
		if (error.status === 401) {
			ctx.status = 401;
			ctx.body = {
				code: 'internal: jwt_expired',
				message: error.originalError
					? error.originalError.message
					: error.message,
			};
		} else {
			console.log(
				`  --> Process API ${ctx.request.method} ${
					ctx.request.url
				} error (${error.code}: ${error.message})...`
			);
			ctx.response.status = 200;
			ctx.response.type = 'application/json';
			ctx.response.body = {
				code: error.code || 'internal: unknown_error',
				message: error.message || '系统未知错误',
			};
		}
	});
});

// body 中间件
app.use(
	koaBody({
		multipart: true, // 支持文件上传
		formidable: {
			maxFieldsSize: 2 * 1024 * 1024, // 上传大小
		},
	})
);

// 路由权限控制
app.use(
	jwtKoa({ secret: jwtSecret }).unless({
		path: [
			/^\/static/,
			/^\/api\/user\/sendCode/,
			/^\/api\/user\/signUp/,
			/^\/api\/user\/signIn/,
			/^\/api\/user\/getUserAvatar/,
			/^\/api\/user\/setUserAvatar/,
			/^\/api\/user\/verificationToken/,
			/^\/api\/user\/weChatSignIn/,
			/^\/api\/user\/weChatAuthorize/,
		],
	})
);

// 添加 .rest() 方法到 ctx
app.use(rest.restify());

// 重新签发令牌
app.use(reIssueToken());

// 路由中间件
app.use(controller());

// mongoose 初始化
mongoose.init();

// koaServer
const server = app.listen(3000);

// mqtt Server
mqtt.server();

global.io = require('socket.io')(server, {
	allowRequest: wss.allowRequest,
});

// wss
wss.init(server);
