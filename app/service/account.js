const Service = require('egg').Service;

class AccountService extends Service {
  async login({ username, password }) {
    const user = await this.ctx.model.User.findOne({
      username,
      password,
    });
    this.ctx.logger.debug(user);

    if (user && !await this.app.redis.hExists('balance', username)) {
      // write user balance to redis
      await this.cacheBalance(username, user.balance);
    }

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

    if (balance + amount < 0) {
      // balance is not enough
      this.ctx.throwError(400, '餘額不足');
      return;
    }

    try {
      balance = await this.app.redis.hIncrBy('balance', this.ctx.userName, amount);

      // write record to redis
      const record = {
        user: this.ctx.userName,
        amount,
        balance,
        createdAt: Date.now(),
      };
      await this.app.redis.rPush('record', JSON.stringify(record));
    } catch (err) {
      this.ctx.throwError(500, '資料更新失敗', err);
      this.ctx.logger.warn(err);
      return;
    }

    this.ctx.body = { balance };
  }

  /**
   * @param {string} username
   * @return {Promise<number | null>} user balance or null, if not found
  */
  async getBalance(username) {
    let balance = await this.app.redis.hGet('balance', username);

    // if user not cached
    if (!balance) {
      // load user from mysql
      this.app.logger.debug(`load user ${username} from MySQL`);
      const user = await this.service.user.find(username);
      if (!user) { // user not found
        return null;
      }

      balance = user.balance;
      await this.cacheBalance(username, balance);
      balance = Number(balance);
    }

    return balance;
  }

  /**
   *
   * @param {string} username
   * @param {number} amount
   */
  async cacheBalance(username, amount) {
    return this.app.redis.hSet('balance', username, amount)
      .then(res => {
        this.ctx.logger.debug(`successfully update cache of user ${username}`);
        return res;
      })
      .catch(err => {
        this.ctx.logger.warn(`update cache of user ${username} failed\n` + err);
        this.app.redis.hDel('balance', username);
      });
  }
}

module.exports = AccountService;
