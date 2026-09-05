import { getRepository } from '../src/dataSource';
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
import { applyJobSymbolLimit } from './jobSymbolLimit';

const JOB_NAME = 'feed-eps';

const MAX_CALL_TIMES_PER_MINUTE = 300; // 300 calls/min
// Renewed on every symbol, but the work after the symbol loop runs without a
// heartbeat, so the window has to cover that tail too.
const JOB_LOCK_TTL_SECONDS = 60 * 60 * 2;

const eventId = uuidv4();


start(JOB_NAME, async () => {
  const JOB_IN_PROGRESS = `JOBKEY_${JOB_NAME}`;
  const acquired = await redisCache.acquireLock(JOB_IN_PROGRESS, JOB_LOCK_TTL_SECONDS);
  if (!acquired) {
    console.log('Other process is still running, skip this run');
    return;
  }

  try {
    const sleepTime = 60 * 1000 / MAX_CALL_TIMES_PER_MINUTE;
    const stocks = await getRepository(Stock)
      .find({
        order: {
          symbol: 'ASC'
        },
        select: { symbol: true },
      });
    const symbols = applyJobSymbolLimit(stocks.map(s => s.symbol), JOB_NAME);

    let count = 0;
    const failed = [];
    for await (const symbol of symbols) {
      await redisCache.renewLock(JOB_IN_PROGRESS, JOB_LOCK_TTL_SECONDS);

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
