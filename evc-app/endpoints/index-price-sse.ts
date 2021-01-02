import errorToJson from 'error-to-json';
import * as EventSource from 'eventsource';
import * as dotenv from 'dotenv';
import { RedisRealtimePricePubService } from '../src/services/RedisPubSubService';
import { redisCache } from '../src/services/redisCache';
import { StockLastPriceInfo } from '../src/types/StockLastPriceInfo';
import 'colors';
import { start } from './jobStarter';
import { getManager, getConnection, getRepository } from 'typeorm';
import { StockLastPrice } from '../src/entity/StockLastPrice';
import { connectDatabase } from '../src/db';
import { executeSqlStatement } from './executeSqlStatement';
import * as moment from 'moment';

const publisher = new RedisRealtimePricePubService();

async function saveLastPrice(priceList: StockLastPriceInfo[]) {
  // for (const p of priceList) {
  //   const { symbol, price, time } = p;
  //   const key = `lastPrice.${symbol}`;
  //   redisCache.set(key, data);
  // }

  const values = priceList.map(p => {
    const { symbol, price, time } = p;
    return {
      symbol,
      price,
      updatedAt: new Date(time)
    }
  });

  // for(const v of values) {
  //   const lastPrice = new StockLastPrice();
  //   lastPrice.symbol = v.symbol;
  //   lastPrice.price = v.price;
  //   lastPrice.updatedAt = v.updatedAt;
  //   await getRepository(StockLastPrice).insert(lastPrice);
  // }

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockLastPrice)
    .onConflict(`(symbol) DO UPDATE SET price = excluded.price, "updatedAt" = excluded."updatedAt"`)
    .values(values)
    .execute();

  // await executeSqlStatement(priceList, item => {
  //   const { symbol, price, time } = item;
  //   const updated = moment(time).format('YYYY-MM-DD HH:mm:ss');
  //   return `INSERT INTO public.stock_last_price(symbol, price, "updatedAt") VALUES ('${symbol}', ${price}, timezone('UTC', '${updated}')) ON CONFLICT (symbol) DO UPDATE SET price = excluded.price, "updatedAt" = excluded."updatedAt"`;
  // });
}

async function publishPriceEvents(priceList: StockLastPriceInfo[]) {
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
    const priceList = JSON.parse(data) as StockLastPriceInfo[];
    if (priceList?.length) {
      publishPriceEvents(priceList);
      saveLastPrice(priceList).catch(err => console.error('Task sse saveLastPrice', errorToJson(err)));
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