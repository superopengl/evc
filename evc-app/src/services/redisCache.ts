import redis from 'redis';

class RedisCache {
  private redisCache;
  constructor(redisUrl: string) {
    this.redisCache = redis.createClient(redisUrl);

  }

  async get(key) {
    return new Promise((res, rej) => {
      this.redisCache.get(key, (err, result) => {
        return err ? rej(err) : res(JSON.parse(result));
      });
    });
  }

  async ttl(key) {
    return new Promise((res, rej) => {
      this.redisCache.ttl(key, (err, result) => {
        return err ? rej(err) : res(JSON.parse(result));
      });
    });
  }

  async del(key) {
    return new Promise((res, rej) => {
      this.redisCache.del(key, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }


  async set(key: string, value: any) {
    return new Promise((res, rej) => {
      this.redisCache.set(key, JSON.stringify(value), (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async setex(key: string, value: any, seconds: number) {
    return new Promise((res, rej) => {
      this.redisCache.setex(key, seconds, JSON.stringify(value), (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  /**
   * Atomically takes a lock that expires on its own. Resolves false when another
   * process already holds it.
   *
   * The expiry is the important part: a lock written with a plain set() outlives
   * the process holding it, so a killed job leaves the key behind forever and
   * every later run silently skips itself. Long running holders should call
   * renewLock() to push the expiry back while they work.
   */
  async acquireLock(key: string, expireInSeconds: number): Promise<boolean> {
    return new Promise((res, rej) => {
      const value = JSON.stringify(new Date().toUTCString());
      this.redisCache.set(key, value, 'NX', 'EX', expireInSeconds, (err, result) => {
        return err ? rej(err) : res(result === 'OK');
      });
    });
  }

  /**
   * Pushes back the expiry of a lock held by this process, so work that takes
   * longer than the original window does not lose the lock part way through.
   */
  async renewLock(key: string, expireInSeconds: number) {
    return this.setex(key, new Date().toUTCString(), expireInSeconds);
  }

  async incr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.incr(key, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async decr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.decr(key, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async keys(pattern: string = '*') {
    return new Promise((res, rej) => {
      this.redisCache.keys(pattern, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async flush() {
    return new Promise((res, rej) => {
      this.redisCache.flushall((err, reply) => {
        return err ? rej(err) : res(reply);
      });
    });
  }
}

export const redisCache = new RedisCache(process.env.REDIS_URL);