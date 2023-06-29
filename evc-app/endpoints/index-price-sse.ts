import errorToJson from 'error-to-json';
import * as EventSource from 'eventsource';
import * as dotenv from 'dotenv';
import { RedisRealtimePricePubService } from '../src/services/RedisPubSubService';
import { redisCache } from '../src/services/redisCache';
import { StockLastPrice } from '../src/types/StockLastPrice';
import 'colors';
import { start } from './jobStarter';

const publisher = new RedisRealtimePricePubService();

async function updateLastPriceInCache(priceList: StockLastPrice[]) {
  for (const p of priceList) {
    const { symbol, ...data } = p;
    const key = `stock.${symbol}.lastPrice`;
    redisCache.set(key, data);
  }
}

async function publishPriceEvents(priceList: StockLastPrice[]) {
  for (const p of priceList) {
    // p.symbol = 'GOOG';
    const event = {
      type: 'price',
      data: p
    }
    publisher.publish(event);
  }
}

function handleMessage(data) {
  try {
    const priceList = JSON.parse(data) as StockLastPrice[];
    if (priceList?.length) {
      publishPriceEvents(priceList);
      updateLastPriceInCache(priceList);
    }
  } catch (err) {
    console.error('Task', 'sse', 'message error', errorToJson(err));
  }
}

const JOB_NAME = 'price-sse';

start(JOB_NAME, async () => {
  let es: EventSource = null;
  try {
    const url = `${process.env.IEXCLOUD_SSE_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/last?token=${process.env.IEXCLOUD_PUBLIC_KEY}`;
    console.log('Task', JOB_NAME, 'url', url);
    es = new EventSource(url);

    es.onopen = () => {
      console.log('Task', JOB_NAME, 'opened');
    };
    es.onerror = (err) => {
      console.log(`Task ${JOB_NAME} error`.red, err);
    };
    es.onmessage = (e) => handleMessage(e.data);
  } catch (err) {
    console.log(`Task ${JOB_NAME} error`.red, err);
    es?.close();
  }
});