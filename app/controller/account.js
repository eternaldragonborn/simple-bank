const { Controller } = require("egg");
const jwt = require('jsonwebtoken');

module.exports = class AccountController extends Controller {
  async create() {
    const { ctx } = this;

    const createRule = {
      password: {
        type: 'password',
        compare: 're-password',
      },
    }

    const userData = ctx.request.body;

    try {
      ctx.validate(createRule);
    } catch (err) {
      ctx.throwError(403, '二次輸入密碼不相同');
      return;
    }

    const result = await ctx.model.User.findOne({ username: userData.username });
    if (result) {
      // user already exist
      ctx.throwError(403, '使用者名稱已被使用');
    } else {
      await ctx.model.User.create({
        username: userData.username,
        password: userData.password,
        balance: 0,
      });
      ctx.logger.info(`user ${userData.username} created`);

      ctx.body = 'OK';
    }
  }

  async login() {
    const { ctx } = this;

    const loginData = ctx.request.body;
    const user = await ctx.service.account.login({
      username: loginData.username,
      password: loginData.password,
    });

    if (!user) {
      ctx.throwError(403, '帳號或密碼錯誤', loginData);
      return;
    }

    const token = jwt.sign({
      user: user.attribute('username')
    }, process.env.JWT_SECRET,
    );

    ctx.body = {
      balance: user.balance,
      token,
    }
  }

  async recipes() {
    const { ctx } = this;

    // TODO: refactor to service
    const user = await ctx.model.User.findOne({ username: ctx.userName });

    if (!user) {
      ctx.throwError(403, '未知的使用者', userName)
      return;
    }

    let recipes = await ctx.model.Record
      .find({ user: ctx.userName })
      .select(name => name !== 'user' && name !== 'id')
      .order('createdAt', 'desc');
    // ctx.logger.debug(recipes);
    ctx.body = recipes;
  }

  async balance() {
    const { ctx } = this;

    try {
      try {
        const user = await ctx.service.user.find(ctx.userName);
        ctx.body = { balance: user.balance, username: user.username };
      } catch (err) {
        ctx.throwError(400, '未知的使用者', userPayload);
      }
    } catch (err) {
      ctx.throwError(403, '無效的token', ctx.request.userToken);
      return;
    }
  }
}
