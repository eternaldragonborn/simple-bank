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
    if (balance === null) {
      this.ctx.throwError(404, '未知的使用者', this.ctx.userName);
      return;
    }

    if (balance + amount < 0) {
      // balance is not enough
      this.ctx.throwError(400, '餘額不足');
      return;
    }

    let cachedRecordCount;
    try {
      balance = await this.app.redis.hIncrBy('balance', this.ctx.userName, amount);

      // write record to redis
      const record = {
        user: this.ctx.userName,
        amount,
        balance,
        createdAt: Date.now(),
      };
      cachedRecordCount = await this.app.redis.lPush('record', JSON.stringify(record));
    } catch (err) {
      this.ctx.throwError(500, '資料更新失敗', err);
      this.ctx.logger.warn(err);
      return;
    }

    this.ctx.body = { balance };

    if (cachedRecordCount > 10) {
      this.app.runSchedule('sync_cache');
    }
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
    } else {
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
  /**
   * @typedef {{
   *  amount: number,
   *  balance: number,
   *  createdAt: number
   * }} Record
   */

  /**
   *
   * @param {string} username
   * @return {Promise<Record[] | null>}
   */
  async loadRecipes(username) {
    // ? check if user exists
    /** @type {Record[]} */
    const recipes = [];

    // load from redis
    const cachedRecords = await this.app.redis.lRange('record', 0, -1);
    if (cachedRecords.length !== 0) {
      cachedRecords.forEach(record => {
        record = JSON.parse(record);
        if (record.user === username) {
          recipes.push({
            amount: record.amount,
            balance: record.balance,
            createdAt: record.createdAt,
          });
        }
      });

    }

    // load from MySQL
    const recipeRecords = await this.ctx.model.Record
      .find({ user: username })
      .select('amount', 'balance', 'createdAt')
      .order('createdAt', 'desc');

    const parsedRecipes = recipeRecords.map(record => {
      return {
        amount: record.amount,
        balance: record.balance,
        createdAt: record.createdAt.getTime(),
      };
    });
    recipes.push(...parsedRecipes);
    this.ctx.logger.debug(`${recipes.length} records loaded`);

    return recipes;
  }
}

module.exports = AccountService;
