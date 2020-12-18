import errorToJson from 'error-to-json';
import * as EventSource from 'eventsource';
import * as dotenv from 'dotenv';
import { RedisRealtimePricePubService } from '../src/services/RedisPubSubService';
import { redisCache } from '../src/services/redisCache';

const publisher = new RedisRealtimePricePubService();

type LastPrice = {
  symbol: string,
  price: number,
  size: number,
  time: Date
}

async function updateLastPriceInCache(priceList: LastPrice[]) {
  for(const p of priceList) {
    const key = `stock.${p.symbol}.lastPrice`;
    redisCache.set(key, p);
  }
}

function handleMessage(data) {
  try {
    const priceList = JSON.parse(data) as LastPrice[];
    if (priceList) {
      
      // Publish prices.
      publisher.publish(data);
      updateLastPriceInCache(priceList);
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
    es?.close();
  }
};

start();