const Koa = require('koa'); // Koa
const bodyParser = require('koa-bodyparser'); // koa-bodyparser 使用ctx.body解析中间件
const cors = require('koa2-cors'); // cors 跨域
const jwtKoa = require('koa-jwt'); // koa-jwt
const logger = require('koa-logger'); // log
const static = require('koa-static'); // 静态资源服务

// controller
const controller = require('./src/middleware/controller');
// REST API
const rest = require('./src/middleware/rest');
// mongoose
const mongoose = require('./src/middleware/mongoose');
// mqtt
const mqtt = require('./src/middleware/mqtt');
// wss
const wss = require('./src/middleware/websocketServer');
/* jwt密钥 */
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

app.use(static(__dirname + staticPath));

// token 验证异常时候的处理，如过期、错误
app.use((ctx, next) => {
	return next().catch(err => {
		// console.log(err);
		if (err.status === 401) {
			ctx.status = 401;
			ctx.body = {
				code: 'internal: jwt_expired',
				msg: err.originalError
					? err.originalError.message
					: err.message,
			};
		} else {
			// throw err;
			console.log(
				`--- Process API ${ctx.request.method} ${
					ctx.request.url
				} error (${err.code})...`
			);
			ctx.response.status = 200;
			ctx.response.type = 'application/json';
			ctx.response.body = {
				code: err.code || 'internal: unknown_error',
				message: err.message || '系统未知错误',
			};
		}
	});
});

// bodyparser 中间件
app.use(bodyParser());

// 路由权限控制
app.use(
	jwtKoa({ secret: jwtSecret }).unless({
		path: [
			/^\/static/,
			/^\/api\/user\/sendCode/,
			/^\/api\/user\/signUp/,
			/^\/api\/user\/signIn/,
			/^\/api\/user\/getUserAvatar/,
		],
	})
);

// 添加 .rest() 方法到 ctx
app.use(rest.restify());

// 路由中间件
app.use(controller());

// mongoose 初始化
mongoose.init();

// mqtt Server
mqtt.server();

// koaServer
const server = app.listen(3000);

// wss
wss.init(server);
