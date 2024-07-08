const jwt = require('jsonwebtoken');

module.exports = () => {
  return async (ctx, next) => {
    if (!ctx.userToken) {
      ctx.status = 401;
      ctx.body = '未登入';
      ctx.logger.debug('無token')
      // ctx.redirect('/');
    } else {
      if (!ctx.userName) {
        ctx.redirect('/');
        return;
      }

      ctx.logger.debug('已登入');
      await next();
    }
  }
}