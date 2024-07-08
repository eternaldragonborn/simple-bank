const Service = require('egg').Service;

class UserService extends Service {
  async find(username) {
    const user = await this.ctx.model.User.findOne({
      username
    });

    return user;
  }
}

module.exports = UserService;