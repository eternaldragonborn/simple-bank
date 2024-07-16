const Subscription = require('egg').Subscription;

module.exports = class SyncCache extends Subscription {
  static get schedule() {
    return {
      interval: '1m',
      type: 'worker',
      disable: true,
    };
  }

  async subscribe() {
    if (!await this.app.redis.set('sync_lock', '1', { NX: true, EX: 3000 })) {
      this.app.logger.debug('sync cache is already running');
      return;
    }

    const records = await this.app.redis.lRange('record', 0, -1);
    if (!records || records.length === 0) {
      this.app.logger.debug('no records need to be synced');
      await this.app.redis.del('sync_lock');
      return;
    }

    this.app.logger.info('start syncing cache');
    this.ctx.model.transaction(async ({ connection }) => {
      // bulk create records
      const bulk = records.map(record => {
        const parsedRecord = JSON.parse(record);
        parsedRecord.createdAt = new Date(parsedRecord.createdAt);
        return parsedRecord;
      });
      const recordRows = await this.ctx.model.Record.bulkCreate(bulk, { connection });

      // update user balance
      const userBalance = await this.app.redis.hGetAll('balance');
      const parsedBalance = Object.entries(userBalance)
        .map(([ user, balance ]) => {
          return `WHEN '${user}' THEN ${balance}`;
        })
        .join('\n');

      const userUpdateResult = await this.ctx.model
        .query(`UPDATE users
            SET balance = CASE username
              ${parsedBalance}
            END
            WHERE username IN (${Object.keys(userBalance)
    .map(user => `'${user}'`)
    .join(', ')})`,
        [], { connection });

      return [ recordRows.length, userUpdateResult.affectedRows ];
    })
      .then(async ([ recordCount, userCount ]) => {
        this.app.logger.info(`synced ${recordCount} records & updated ${userCount} users`);
        // clear cached records
        // ? error handling when cleaning the cached records
        await this.app.redis.lTrim('record', 0, -recordCount - 1);
      })
      .catch(err => {
        this.app.logger.error('sync cache failed', err);
      })
      .finally(async () => {
        await this.app.redis.del('sync_lock');
      });
  }
};
