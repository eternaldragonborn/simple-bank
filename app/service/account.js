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

  /**
   * @param {string} username
   * @return {Promise<number | null>} user balance or null, if not found
  */
  async getBalance(username) {
    let balance = await this.app.redis.get(username);

    // if user not cached
    if (!balance) {
      // load user from mysql
      const user = await this.service.user.find(username);
      if (!user) { // user not found
        return null;
      }

      balance = user.balance;
      await this.app.redis.set(username, balance);
    } else {
      balance = Number(balance);
    }

    return balance;
  }
}

module.exports = AccountService;