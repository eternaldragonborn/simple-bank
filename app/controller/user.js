const { Controller } = require('egg');

const userActionRule = {
  amount: {
    type: 'int',
    min: 1,
  },
}

module.exports = class UserController extends Controller {
  async deposit() {
    const { ctx } = this;
    const actionData = ctx.request.body;

    try {
      ctx.validate(userActionRule);
    } catch (err) {
      // amount < 0
      ctx.logger.error('validation failed\n' + JSON.stringify(actionData) + err);
      ctx.status = 403;
      ctx.body = { msg: '金額需大於0' };
      return;
    }

    await ctx.service.account.changeBalance(actionData.amount);
    // ctx.logger.info(`user ${user.username} deposited $${actionData.amount}`);
  }

  async withdraw() {
    const { ctx } = this;
    const actionData = ctx.request.body;

    if (actionData.amount < 0) {
      ctx.throwError(403, '金額須大於0');
      return;
    }

    await ctx.service.account.changeBalance(-actionData.amount);
    // ctx.logger.info(`user ${user.username} withdrew $${actionData.amount}`);
  }

  async records() {

  }
}