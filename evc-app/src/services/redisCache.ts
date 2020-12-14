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
      this.redisCache.set(key, value, (err, value) => {
        return err ? rej(err) : res(value);
      });
    });
  }

  async setex(key: string, seconds: number, value: any) {
    return new Promise((res, rej) => {
      this.redisCache.setex(key, seconds, value, (err, value) => {
        return err ? rej(err) : res(value);
      });
    });
  }

  async incr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.incr(key, (err, value) => {
        return err ? rej(err) : res(value);
      });
    });
  }

  async decr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.decr(key, (err, value) => {
        return err ? rej(err) : res(value);
      });
    });
  }
}

export const redisCache = new RedisCache(process.env.REDIS_URL);