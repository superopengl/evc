import errorToJson from 'error-to-json';
import * as EventSource from 'eventsource';
import { RedisRealtimePricePubService } from '../src/services/RedisPubSubService';
import { StockLastPriceInfo } from '../src/types/StockLastPriceInfo';
import 'colors';
import { start } from './jobStarter';
import { getManager, getRepository, IsNull, LessThan } from 'typeorm';
import { StockLastPrice } from '../src/entity/StockLastPrice';
import { Stock } from '../src/entity/Stock';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, startWith, throttleTime } from 'rxjs/operators';
import { assert } from '../src/utils/assert';
import { EmailSentOutTask } from '../src/entity/EmailSentOutTask';
import { sendEmail } from '../src/services/emailService';
import { getUtcNow } from '../src/utils/getUtcNow';
import * as _ from 'lodash';

const JOB_NAME = 'price-sse';
const SYMBOL_BATCH_SIZE = 50;
const CLIENT_EVENT_FREQUENCY = 5 * 1000; // 5 seconds
const DB_UPDATE_FREQUENCY = 5 * 1000;  // 5 seconds.
const redisPricePublisher = new RedisRealtimePricePubService();
let symbolSourceMap: Map<string, Subject<StockLastPriceInfo>>;

const EMAIL_RATE_LIMIT_PER_SEC = 13; // Max limit rate is 14/sec right now
const EMAIL_POLLING_INTERVAL_SEC = 30;

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

async function startPriceSseDaemon() {
  console.log('Starting price daemon');
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
}

export async function startEmailDaemon() {
  const takeSize = EMAIL_RATE_LIMIT_PER_SEC * EMAIL_POLLING_INTERVAL_SEC;
  const sleepTimeMs = 1000 / EMAIL_RATE_LIMIT_PER_SEC;
  console.log('Starting email daemon');
  while (true) {
    const emailTasks = await getRepository(EmailSentOutTask).find({
      where: {
        sentAt: IsNull(),
        failedCount: LessThan(5)
      },
      order: {
        id: 'ASC'
      },
      take: takeSize
    });

    if (emailTasks.length) {
      console.log(`Email daemon ${emailTasks.length} emails to send out`);

      let okCounter = 0;
      for (const task of emailTasks) {
        try {
          await sendEmail({
            to: task.to,
            from: task.from,
            template: task.template,
            vars: task.vars,
            attachments: task.attachments as { filename: string; path: string }[],
            shouldBcc: task.shouldBcc,
          });
          task.sentAt = getUtcNow();
          await getRepository(EmailSentOutTask).save(task);
          okCounter++;
          await sleep(sleepTimeMs);
        } catch (err) {
          console.log(`Failed to send out email ${task.id}`, errorToJson(err));
          await getRepository(EmailSentOutTask).increment({id: task.id}, 'failedCount', 1);
        }
      }
      console.log(`Email daemon ${emailTasks.length} emails to send out, ${okCounter} succedded.`);
    }

    await sleep(EMAIL_POLLING_INTERVAL_SEC * 1000); // Polling email tasks every 30 seconds
  }
}

start(JOB_NAME, async () => {
  try {
    const priceTask = startPriceSseDaemon();
    const emailTask = startEmailDaemon();

    await Promise.all([priceTask, emailTask]);
  } catch (e) {
    console.error('Fatal error', errorToJson(e));
    process.exit(1);
  }
}, { daemon: true });