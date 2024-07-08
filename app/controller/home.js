const { Controller } = require('egg');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    if (!ctx.request.userToken) {
      await ctx.render('login.ejs');
    } else {
      ctx.redirect('/account');
    }
  }

  async register() {
    const { ctx } = this;
    await ctx.render('register.ejs');
  }

  async account() {
    const { ctx } = this;

    await ctx.render('account.ejs');
  }

  async recipes() {
    const { ctx } = this;

    await ctx.render('recipes.ejs');
  }
}

module.exports = HomeController;
