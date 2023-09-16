import errorToJson from 'error-to-json';
import * as EventSource from 'eventsource';
import { RedisRealtimePricePubService } from '../src/services/RedisPubSubService';
import { StockLastPriceInfo } from '../src/types/StockLastPriceInfo';
import 'colors';
import { start } from './jobStarter';
import { getManager, getRepository } from 'typeorm';
import { StockLastPrice } from '../src/entity/StockLastPrice';
import { Stock } from '../src/entity/Stock';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, startWith, throttleTime } from 'rxjs/operators';
import { assert } from '../src/utils/assert';

const JOB_NAME = 'price-sse';
const SYMBOL_BATCH_SIZE = 50;
const CLIENT_EVENT_FREQUENCY = 5 * 1000; // 5 seconds
const DB_UPDATE_FREQUENCY = 5 * 1000;  // 5 seconds.
const redisPricePublisher = new RedisRealtimePricePubService();
let symbolSourceMap: Map<string, Subject<StockLastPriceInfo>>;

function createSourceForClientPublish() {
  const source$ = new Subject<StockLastPriceInfo>();
  source$
    .pipe(
      throttleTime(CLIENT_EVENT_FREQUENCY)
    )
    .subscribe(p => {
      const event = {
        type: 'price',
        data: p
      };
      redisPricePublisher.publish(event);
    });
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
      throttleTime(DB_UPDATE_FREQUENCY)
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
      const { symbol, price, change, changePercent, time } = p;
      return {
        symbol,
        price,
        change,
        changePercent,
        updatedAt: new Date(time)
      };
    });

  if (values.length) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(StockLastPrice)
      .onConflict('(symbol) DO UPDATE SET price = excluded.price, change = excluded.change, "changePercent" = excluded."changePercent", "updatedAt" = excluded."updatedAt"')
      .values(values)
      .execute();
  }
}

function publishPriceEventsToClient(priceList: StockLastPriceInfo[]) {
  for (const p of priceList) {
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

function createSseForSymbols(symbols: string[]) {
  assert(symbols && symbols.length > 0 && symbols.length <= SYMBOL_BATCH_SIZE, 400, 'Wrong size of symbols. Must be between 1 and 100');
  const symbolsPlainString = symbols.join(',');
  const symbolEncodedString = symbols.map(s => encodeURIComponent(s)).join(',');
  let es: EventSource = null;
  try {
    const url = `${process.env.IEXCLOUD_SSE_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/last?token=${process.env.IEXCLOUD_PUBLIC_KEY}&symbols=${symbolEncodedString}`;
    es = new EventSource(url);

    es.onopen = () => {
      console.log(`Task ${JOB_NAME} opened [${symbolsPlainString}]`);
    };
    es.onerror = (err) => {
      console.log(`Task ${JOB_NAME} error [${symbolsPlainString}]`.red, err);
    };
    es.onmessage = (e) => handleEventMessage(e.data);
  } catch (err) {
    console.log(`Task ${JOB_NAME} error [${symbolsPlainString}]. Closing`.red, err);
    es?.close();
    throw err;
  }
}

async function sleep(ms): Promise<void> {
  return new Promise(res => {
    setTimeout(() => res(), ms);
  });
}

start(JOB_NAME, async () => {
  try {
    await initialize();

    let batch = [];
    for (const symbol of symbolSourceMap.keys()) {
      batch.push(symbol);
      if (batch.length === SYMBOL_BATCH_SIZE) {
        createSseForSymbols(batch);
        batch = [];
        await sleep(200);
      }
    }

    if (batch.length) {
      createSseForSymbols(batch);
    }
  } catch (e) {
    process.exit(1);
  }
}, { daemon: true });