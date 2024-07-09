const REDIS = Symbol('Application#redis');

/** @extends {Egg.Application} */
module.exports = {
  /** @returns {import('redis').RedisClientType} */
  get redis() {
    return this[REDIS];
  },
  set redis(client) {
    this[REDIS] = client;
  },
}