import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { Subject, Subscription } from 'rxjs';
import { SysLog } from '../entity/SysLog';
import { logError } from '../utils/logger';
import * as redis from 'redis';

const redisUrl = process.env.REDIS_URL;

export class RedisPubSubService {
  private publisher = null;
  private subscriber = null;
  private eventSubject$ = new Subject();

  constructor(private channelName) {
    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);

    this.subscriber.on('message', (channel, data) => {
      console.log('Event subscriber channel', channel, 'with data:', data);
      this.eventSubject$.next(data);
    });

    this.subscriber.subscribe(this.channelName);
  }

  public publish(event) {
    const data = JSON.stringify(event);
    this.publisher.publish(this.channelName, data);
  }

  public subscribe(subCallback): Subscription {
    return this.eventSubject$.subscribe(subCallback);
  }
}
