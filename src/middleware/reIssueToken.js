// 重新签发令牌时间
const reIssueTime = require('../config/index').reIssueTime;
const jsonWebToken = require('../utils/jsonWebToken');

module.exports = () => {
	return async (ctx, next) => {
		// console.log('reIssueToken after');
		await next();
		try {
			// console.log(ctx.status === 200);
			if (ctx.status === 200 && ctx.headers.authorization) {
				const payload = jsonWebToken.getJWTPayload(
					ctx.headers.authorization
				);
				// console.log(payload.exp - payload.iat <= reIssueTime);
				if (payload.exp - payload.iat <= reIssueTime) {
					const jwToken = jsonWebToken.getToken({
						userId: payload.userId,
						groupId: payload.groupId,
					});
					ctx.body.token = jwToken;
				}
			}
		} catch (error) {
			if (error.message === 'jwt expired') {
				return;
			}
			console.log(error);
		}
	};
};
