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
import { Stock } from '../src/entity/Stock';
import { combineLatest, Subject } from 'rxjs';
import { throttleTime, debounceTime, startWith } from 'rxjs/operators';

const JOB_NAME = 'price-sse';
const publisher = new RedisRealtimePricePubService();
const CLIENT_EVENT_FREQUENCY = 2 * 1000; //2 seconds
const DB_UPDATE_FREQUENCY = 10 * 1000;  // 10 seconds.
let symbolSourceMap: Map<string, Subject<StockLastPriceInfo>>;

function createSourceForClientPublish() {
  const source$ = new Subject<StockLastPriceInfo>();
  source$
    .pipe(
      debounceTime(CLIENT_EVENT_FREQUENCY)
    )
    .subscribe(p => {
      const event = {
        type: 'price',
        data: p
      }
      publisher.publish(event);
    })
  return source$;
}

async function initialize() {
  if (symbolSourceMap) return;
  const stocks = await getRepository(Stock).find({
    select: ['symbol']
  });
  symbolSourceMap = new Map<string, Subject<StockLastPriceInfo>>();
  for (const s of stocks) {
    const source$ = createSourceForClientPublish();
    symbolSourceMap.set(s.symbol, source$);
  }

  const dbSources = Array.from(symbolSourceMap.values()).map(s => s.pipe(startWith(null)));
  combineLatest(dbSources)
    .pipe(
      debounceTime(DB_UPDATE_FREQUENCY)
    )
    .subscribe(async (list: StockLastPriceInfo[]) => {
      try {
        updateLastPriceInDatabase(list);
      } catch (err) {
        console.error('Task sse saveLastPrice', errorToJson(err));
      }
    });
}

async function updateLastPriceInDatabase(priceList: StockLastPriceInfo[]) {
  const values = priceList
    .filter(p => !!p)
    .map(p => {
      const { symbol, price, time } = p;
      return {
        symbol,
        price,
        updatedAt: new Date(time)
      }
    });

  if (values.length) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(StockLastPrice)
      .onConflict(`(symbol) DO UPDATE SET price = excluded.price, "updatedAt" = excluded."updatedAt"`)
      .values(values)
      .execute();
  }
}

async function publishPriceEventsToClient(priceList: StockLastPriceInfo[]) {
  for (const p of priceList) {
    p.symbol = 'GOOG';
    const subject$ = symbolSourceMap.get(p.symbol);
    if (subject$) {
      subject$.next(p);
    }
  }
}

function handleEventMessage(eventMessage: string) {
  try {
    const priceList = JSON.parse(eventMessage) as StockLastPriceInfo[];
    if (priceList?.length) {
      publishPriceEventsToClient(priceList);
    }
  } catch (err) {
    console.error('Task', 'sse', 'message error', errorToJson(err));
  }
}

start(JOB_NAME, async () => {
  let es: EventSource = null;
  try {
    await initialize();

    const url = `${process.env.IEXCLOUD_SSE_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/last?token=${process.env.IEXCLOUD_PUBLIC_KEY}`;
    console.log('Task', JOB_NAME, 'url', url);
    es = new EventSource(url);

    es.onopen = () => {
      console.log('Task', JOB_NAME, 'opened');
    };
    es.onerror = (err) => {
      console.log(`Task ${JOB_NAME} error`.red, err);
    };
    es.onmessage = (e) => handleEventMessage(e.data);
  } catch (err) {
    console.log(`Task ${JOB_NAME} error`.red, err);
    es?.close();
  }
});