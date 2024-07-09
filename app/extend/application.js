const REDIS = Symbol('Application#redis');

/** @augments {Egg.Application} */
module.exports = {
  /** @return {import('redis').RedisClientType} */
  get redis() {
    return this[REDIS];
  },
  set redis(client) {
    this[REDIS] = client;
  },
};
