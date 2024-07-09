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
   * @param {int} amount
   */
  async changeBalance(amount) {
    let balance = await this.getBalance(this.ctx.userName);
    if (!balance) {
      this.ctx.throwError(404, '未知的使用者', this.ctx.userName);
      return;
    }

    balance += amount;
    if (balance < 0) {
      // balance is not enough
      this.ctx.throwError(400, '餘額不足');
      return;
    }

    try {
      await this.ctx.model.transaction(async ({ connection }) => {
        await this.ctx.model.User.update(
          { username: this.ctx.userName },
          { balance },
          { connection },
        );

        await this.ctx.model.Record.create({
          user: this.ctx.userName,
          amount,
          balance,
          createAt: Date.now(),
        }, { connection });
      });
    } catch (err) {
      this.ctx.throwError(500, '資料更新失敗', err);
      return;
    }

    this.ctx.body = { balance: balance };
    this.app.redis.set(this.ctx.userName, balance)
      .catch((err) => {
        this.ctx.logger.warn(`update cache of user ${this.ctx.userName} failed\n` + err);
        this.app.redis.del(this.ctx.userName);
      });
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
      this.app.logger.debug(`load user ${username} from MySQL`);
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