import { Subject, Subscription } from 'rxjs';
import redis from 'redis';
import _ from 'lodash';

const redisUrl = process.env.REDIS_URL;

class RedisPubService {
  private publisher = null;

  constructor(private channelName) {
    this.publisher = redis.createClient(redisUrl);
  }

  public publish(event) {
    if (!event) return;
    const data = _.isString(event) ? event : JSON.stringify(event);
    // console.log('Event subscriber channel', 'with data:', data, event);
    this.publisher.publish(this.channelName, data);
  }
}

export class RedisSubService {
  private subscriber = null;
  private eventSubject$ = new Subject();

  constructor(private channelName) {
    this.subscriber = redis.createClient(redisUrl);

    this.subscriber.on('message', (channel, data) => {
      // console.log('Event subscriber channel', channel, 'with data:', data);
      this.eventSubject$.next(data);
    });

    this.subscriber.subscribe(this.channelName);
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