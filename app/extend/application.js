const REDIS = Symbol('Application#redis');

module.exports = {
  /** @return {import('redis').RedisClientType} */
  get redis() {
    return this[REDIS];
  },
  set redis(client) {
    this[REDIS] = client;
  },
};
