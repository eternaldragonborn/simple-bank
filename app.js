const redis = require('redis');

/**
 * @type {import('egg').Boot}
 * @implements {Egg.IBoot}
 */
module.exports = class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    this.app.redis = await redis.createClient(this.app.config.redis)
      .on('error', err => this.app.logger.warn('Redis client error\n' + err))
      .on('connect', () => this.app.logger.info('redis connected'))
      .connect();

    const res = await this.app.redis.ping();
    this.app.logger.debug(res);
  }

  async beforeClose() {
    await this.app.redis.disconnect();
  }
}