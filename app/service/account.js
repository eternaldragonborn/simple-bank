const Service = require('egg').Service;

class AccountService extends Service {
  async login({ username, password }) {
    const user = await this.ctx.model.User.findOne({
      username,
      password,
    });
    this.ctx.logger.debug(user);

    return user;
  }
  /**
   *
   * @param {import('egg-orm').Bone} user
   * @param {int} amount
   */
  async balanceChange(amount) {
    const user = await this.ctx.model.User.findOne({ username: this.ctx.userName });
    if (!user) {
      // user not exist
      this.ctx.throwError(404, '未知的使用者', actionData);
      return;
    }

    user.balance += amount;
    if (user.balance < 0) {
      // not enough balance
      this.ctx.throwError(400, '餘額不足');
      return;
    }


    try {
      await this.ctx.model.transaction(async ({ connection }) => {
        await user.save({ connection });
        await this.ctx.model.Record.create({
          user: user.username,
          amount,
          balance: user.balance,
          createAt: Date.now(),
        }, { connection });
      });
    } catch (err) {
      this.ctx.logger.error('transaction failed\n' + err);
      this.ctx.status = 500;
      this.ctx.body = '資料更新失敗';
      return;
    }

    this.ctx.body = { balance: user.balance }
  }

  async getBalance() {
    const user = await this.ctx.service.user.find(this.ctx.username);
    return user.balance;
  }
}

module.exports = AccountService;