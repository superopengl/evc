import { createClient } from 'redis';

const CONNECT_TIMEOUT_MS = 5 * 1000;

class RedisCache {
  private client: ReturnType<typeof createClient>;
  private connecting: Promise<unknown> | null = null;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    /**
     * node-redis 3 connected eagerly from the constructor, so an unreachable Redis emitted an
     * unhandled 'error' event at import time and took the process down before Express started.
     * v4+ only connects on demand; this handler keeps a blip logged rather than fatal.
     */
    this.client.on('error', err => console.error('Redis client error:', err?.message));
  }

  /**
   * Connects on first use, bounded by CONNECT_TIMEOUT_MS.
   *
   * The timeout matters: node-redis keeps reconnecting forever by default, so connect() never
   * settles while Redis is down and an awaiting request would hang rather than fail. Racing it
   * lets callers get an error quickly while the underlying reconnect carries on in the
   * background, so the cache heals by itself once Redis returns.
   */
  private async getClient() {
    if (this.client.isReady) {
      return this.client;
    }
    if (!this.connecting) {
      this.connecting = this.client.connect().catch(err => {
        this.connecting = null;
        throw err;
      });
    }
    let timer;
    try {
      await Promise.race([
        this.connecting,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Redis connect timed out')), CONNECT_TIMEOUT_MS);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
    return this.client;
  }

  async get(key) {
    const client = await this.getClient();
    const raw = await client.get(key);
    // v5 types this as string | Buffer | null. A missing key returned null through
    // JSON.parse(null) under v3, so keep resolving null rather than throwing.
    if (raw === null || raw === undefined) {
      return null;
    }
    return JSON.parse(typeof raw === 'string' ? raw : raw.toString());
  }

  async ttl(key) {
    const client = await this.getClient();
    return client.ttl(key);
  }

  async del(key) {
    const client = await this.getClient();
    return client.del(key);
  }

  async set(key: string, value: any) {
    const client = await this.getClient();
    return client.set(key, JSON.stringify(value));
  }

  async setex(key: string, value: any, seconds: number) {
    const client = await this.getClient();
    return client.setEx(key, seconds, JSON.stringify(value));
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
    const client = await this.getClient();
    const value = JSON.stringify(new Date().toUTCString());
    // v3 took positional flags ('NX', 'EX', n); v4+ takes an options object. Still returns
    // 'OK' when the key was set and null when it already existed.
    const result = await client.set(key, value, { NX: true, EX: expireInSeconds });
    return result === 'OK';
  }

  /**
   * Pushes back the expiry of a lock held by this process, so work that takes
   * longer than the original window does not lose the lock part way through.
   */
  async renewLock(key: string, expireInSeconds: number) {
    return this.setex(key, new Date().toUTCString(), expireInSeconds);
  }

  async incr(key: string) {
    const client = await this.getClient();
    return client.incr(key);
  }

  async decr(key: string) {
    const client = await this.getClient();
    return client.decr(key);
  }

  async keys(pattern: string = '*') {
    const client = await this.getClient();
    return client.keys(pattern);
  }

  async flush() {
    const client = await this.getClient();
    return client.flushAll();
  }
}

export const redisCache = new RedisCache(process.env.REDIS_URL);
