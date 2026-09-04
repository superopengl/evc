import { Subject, Subscription } from 'rxjs';
import { createClient } from 'redis';
import _ from 'lodash';

const redisUrl = process.env.REDIS_URL;

/**
 * node-redis 4+ does not connect from the constructor and has no 'message' event: a subscriber
 * passes its listener to subscribe() and must be a dedicated connection, which is why publisher
 * and subscriber stay separate clients here.
 */
function createRedisClient(label: string) {
  const client = createClient({ url: redisUrl });
  client.on('error', err => console.error(`Redis ${label} error:`, err?.message));
  return client;
}

class RedisPubService {
  private publisher = createRedisClient('publisher');
  private ready: Promise<unknown> | null = null;

  constructor(private channelName) { }

  private connect() {
    if (!this.ready) {
      this.ready = this.publisher.connect().catch(err => {
        this.ready = null;
        throw err;
      });
    }
    return this.ready;
  }

  /**
   * Fire and forget, as it was under v3 - callers do not await it. The difference is that v4+
   * returns a promise, so the rejection has to be swallowed here or it surfaces as an unhandled
   * rejection when Redis is down.
   */
  public publish(event) {
    if (!event) return;
    const data = _.isString(event) ? event : JSON.stringify(event);
    Promise.resolve()
      .then(() => (this.publisher.isReady ? undefined : this.connect()))
      .then(() => this.publisher.publish(this.channelName, data))
      .catch(err => console.error('Redis publish failed:', err?.message));
  }
}

export class RedisSubService {
  private subscriber = createRedisClient('subscriber');
  private eventSubject$ = new Subject();

  constructor(private channelName) {
    this.subscriber.connect()
      // v4+ takes the listener here instead of emitting a 'message' event.
      .then(() => this.subscriber.subscribe(this.channelName, message => {
        this.eventSubject$.next(message);
      }))
      .catch(err => console.error('Redis subscribe failed:', err?.message));
  }

  public subscribe(subCallback): Subscription {
    return this.eventSubject$.subscribe(subCallback);
  }
}

const REDIS_CHANNEL_NAME = 'stock_realtime_price';

export class RedisRealtimePricePubService extends RedisPubService {
  constructor() {
    super(REDIS_CHANNEL_NAME);
  }
}

export class RedisRealtimePriceSubService extends RedisSubService {
  constructor() {
    super(REDIS_CHANNEL_NAME);
  }
}
