module.exports = {
	apps: [
		{
			name: 'SmartHome', // 项目名
			script: 'app.js', // 执行文件

			// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
			args: 'one two', // 传递给脚本的参数
			instances: 1,
			error_file: './logs/app-err.log', // 错误日志文件
			out_file: './logs/app-out.log', // 正常日志文件
			merge_logs: true, // 设置追加日志而不是新建日志
			log_date_format: 'YYYY-MM-DD HH:mm:ss', // 指定日志文件的时间格式
			autorestart: true, // 默认为true, 发生异常的情况下自动重启
			watch: false, // 是否监听文件变动然后重启
			ignore_watch: [
				// 不用监听的文件
				'node_modules',
				'logs',
			],
			max_memory_restart: '1G', // 最大内存限制数，超出自动重启
			env: {
				NODE_ENV: 'development', // 环境参数，当前指定为开发环境
			},
			env_production: {
				NODE_ENV: 'production', // 环境参数，当前指定为生产环境
			},
		},
	],

	// deploy: {
	// 	production: {
	// 		user: 'node',
	// 		host: '212.83.163.1',
	// 		ref: 'origin/master',
	// 		repo: 'git@github.com:repo.git',
	// 		path: '/var/www/production',
	// 		'post-deploy':
	// 			'npm install && pm2 reload ecosystem.config.js --env production',
	// 	},
	// },
};
