import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { syncStockEps } from '../src/services/stockEpsService';
import * as delay from 'delay';
import errorToJson from 'error-to-json';
import * as moment from 'moment';
import { redisCache } from '../src/services/redisCache';
import { handleWatchlistSupportResistanceChangedNotification } from './handleWatchlistSupportResistanceChangedNotification';
import { refreshMaterializedView } from '../src/db';
import { executeWithDataEvents } from '../src/services/dataLogService';
import { handleWatchlistFairValueChangedNotification } from './handleWatchlistFairValueChangedNotification';

const JOB_NAME = 'feed-eps';

const MAX_CALL_TIMES_PER_MINUTE = 300; // 300 calls/min


start(JOB_NAME, async () => {
  const JOB_IN_PROGRESS = `JOBKEY_${JOB_NAME}`;
  const running = await redisCache.get(JOB_IN_PROGRESS);
  if (running) {
    console.log('Other job is still running, skip this run');
    return;
  }
  await redisCache.setex(JOB_IN_PROGRESS, 60 * 95, true); // Lock for 95 minutes

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
    const symbols = stocks.map(s => s.symbol);

    let count = 0;
    const failed = [];
    for await (const symbol of symbols) {
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
        const msg = `${JOB_NAME} ${Symbol} ${++count}/${symbols.length} failed ${JSON.stringify(errorJson)}`
        console.error(msg, e);
        failed.push(msg);
      }
    }

    for (const err of failed) {
      console.error(err);
    }

    await executeWithDataEvents('refresh materialized views', JOB_NAME, refreshMaterializedView);

    await handleWatchlistSupportResistanceChangedNotification();
    await handleWatchlistFairValueChangedNotification();
  } finally {
    await redisCache.del(JOB_IN_PROGRESS);
  }
});
