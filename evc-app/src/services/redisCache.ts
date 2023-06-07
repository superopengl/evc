import * as redis from 'redis';

class RedisCache {
  private redisCache;
  constructor(redisUrl: string) {
    this.redisCache = redis.createClient(redisUrl);

  }

  async get(key) {
    return new Promise((res, rej) => {
      this.redisCache.get(key, (err, value) => {
        return err ? rej(err) : res(value);
      });
    });
  }

  async del(key) {
    return new Promise((res, rej) => {
      this.redisCache.del(key, (err, value) => {
        return err ? rej(err) : res(value);
      });
    });
  }


  async set(key: string, value: any) {
    return new Promise((res, rej) => {
      this.redisCache.set(key, value, (err, data) => {
        return err ? rej(err) : res();
      });
    });
  }

  async incr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.incr(key, (err, data) => {
        return err ? rej(err) : res();
      });
    });
  }

  async decr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.decr(key, (err, data) => {
        return err ? rej(err) : res();
      });
    });
  }
}

export const redisCache = new RedisCache(process.env.REDIS_URL);