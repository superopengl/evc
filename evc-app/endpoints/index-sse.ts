import errorToJson from 'error-to-json';
import * as EventSource from 'eventsource';
import * as dotenv from 'dotenv';
import { RedisRealtimePricePubService } from '../src/services/RedisPubSubService';

const publisher = new RedisRealtimePricePubService();

function handleMessage(data) {
  try {
    const event = JSON.parse(data)[0];
    if (event) {
      // console.error('Task', 'sse', 'message', event);
      publisher.publish(event);
    }
  } catch (err) {
    console.error('Task', 'sse', 'message error', errorToJson(err));
  }
}

export const start = async () => {
  let es: EventSource = null;
  try {
    dotenv.config();

    const url = `${process.env.IEXCLOUD_SSE_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/last?token=${process.env.IEXCLOUD_PUBLIC_KEY}`;
    console.log('Task', 'sse', 'url', url);
    es = new EventSource(url);

    es.onopen = () => {
      console.log('Task', 'sse', 'opened');
    };
    es.onerror = (err) => {
      console.log('Task', 'sse', 'error', err);
    };
    es.onmessage = (e) => handleMessage(e.data);
  } catch (err) {
    console.error('Task', 'sse', 'failed', errorToJson(err));
  }
};