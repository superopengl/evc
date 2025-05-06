import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { syncStockEps } from '../src/services/stockEpsService';
import delay from 'delay';
import errorToJson from 'error-to-json';
import moment from 'moment';
import { redisCache } from '../src/services/redisCache';
import { handleWatchlistSupportResistanceChangedNotification } from './handleWatchlistSupportResistanceChangedNotification';
import { refreshMaterializedView } from '../src/refreshMaterializedView';
import { executeWithDataEvents } from '../src/services/dataLogService';
import { handleWatchlistFairValueChangedNotification } from './handleWatchlistFairValueChangedNotification';
import { v4 as uuidv4 } from 'uuid';

const JOB_NAME = 'feed-eps';

const MAX_CALL_TIMES_PER_MINUTE = 300; // 300 calls/min
const eventId = uuidv4();


start(JOB_NAME, async () => {
  const JOB_IN_PROGRESS = `JOBKEY_${JOB_NAME}`;
  const running = await redisCache.get(JOB_IN_PROGRESS);
  if (running) {
    console.log('Other process is still running, skip this run');
    return;
  }
  // await redisCache.setex(JOB_IN_PROGRESS, 60 * 60 * 2, true); // Lock for 120 minutes
  await redisCache.set(JOB_IN_PROGRESS, new Date().toUTCString());

  try {
    const sleepTime = 60 * 1000 / MAX_CALL_TIMES_PER_MINUTE;
    const stocks = await getRepository(Stock)
      .find({
        order: {
          symbol: 'ASC'
        },
        select: [
          'symbol'
        ],
      });
    const symbols = ['AAPL']; // stocks.map(s => s.symbol);

    let count = 0;
    const failed = [];
    for await (const symbol of symbols) {
      await redisCache.set(JOB_IN_PROGRESS, new Date().toUTCString());

      try {
        const startTime = moment();
        await syncStockEps(symbol);
        console.log(JOB_NAME, symbol, `${++count}/${symbols.length} done`);
        const timeSpan = moment().diff(startTime, 'milliseconds');
        const sleepMs = sleepTime - timeSpan;
        if (sleepMs > 0) {
          await delay(sleepMs);
        }
      } catch (e) {
        const errorJson = errorToJson(e);
        const msg = `${JOB_NAME} ${Symbol} ${++count}/${symbols.length} failed ${JSON.stringify(errorJson)}`;
        console.error(msg, e);
        failed.push(msg);
      }
    }

    for (const err of failed) {
      console.error(err);
    }

    await executeWithDataEvents('refresh materialized views', JOB_NAME, refreshMaterializedView, { eventId });

    await handleWatchlistSupportResistanceChangedNotification();
    await handleWatchlistFairValueChangedNotification();
  } finally {
    await redisCache.del(JOB_IN_PROGRESS);
  }
}, { eventId });
