import { getManager, getRepository } from '../src/dataSource';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { refreshMaterializedView } from '../src/refreshMaterializedView';
import { executeWithDataEvents } from '../src/services/dataLogService';
import _ from 'lodash';
import delay from 'delay';
import errorToJson from 'error-to-json';
import { syncStockHistoricalClose } from '../src/services/stockCloseService';
import { StockResistance } from '../src/entity/StockResistance';
import { StockSupport } from '../src/entity/StockSupport';
import { StockDeprecateResistance } from '../src/entity/views/StockDeprecateResistance';
import { StockDeprecateSupport } from '../src/entity/views/StockDeprecateSupport';
import { handleWatchlistSupportResistanceChangedNotification } from './handleWatchlistSupportResistanceChangedNotification';
import { handleWatchlistFairValueChangedNotification } from './handleWatchlistFairValueChangedNotification';
import { StockDailyClose } from '../src/entity/StockDailyClose';
import { redisCache } from '../src/services/redisCache';
import { v4 as uuidv4 } from 'uuid';

const JOB_NAME = 'feed-historical-close';

// Renewed on every symbol, but the work after the symbol loop runs without a
// heartbeat, so the window has to cover that tail too.
const JOB_LOCK_TTL_SECONDS = 60 * 60 * 2;
const MAX_CALL_TIMES_PER_MINUTE = 50;
const eventId = uuidv4();

async function scrubSupports() {

  await getManager().transaction(async m => {
    const list = await m.getRepository(StockDeprecateSupport).find();

    console.log('Scrub support', JSON.stringify(list));

    if (!list.length) {
      return;
    }

    // Move deprecate supports to resistance
    const ids = list.map(x => x.supportId);
    const deleteResult = await m
      .createQueryBuilder()
      .delete()
      .from(StockSupport)
      .whereInIds(ids)
      .execute();

    console.log('Delete support', JSON.stringify(deleteResult));

    const insertEntities = list.map(x => {
      const entity = new StockResistance();
      entity.symbol = x.symbol;
      entity.lo = x.supportLo;
      entity.hi = x.supportHi;
      return entity;
    });

    const insertResult = await m.createQueryBuilder()
      .insert()
      .into(StockResistance)
      .values(insertEntities)
      .execute();

    console.log('Moved from support to resistance', JSON.stringify(insertResult));
  });

}

async function scrubResistances() {
  await getManager().transaction(async m => {
    const list = await m.getRepository(StockDeprecateResistance).find();

    console.log('Scrub resistance', JSON.stringify(list));

    if (!list.length) {
      return;
    }
    // Delete resistance
    const ids = list.map(x => x.resistanceId);
    const deleteResult = await m
      .createQueryBuilder()
      .delete()
      .from(StockResistance)
      .whereInIds(ids)
      .execute();

    console.log('Delete resistance', JSON.stringify(deleteResult));

    const insertEntities = list.map(x => {
      const entity = new StockSupport();
      entity.symbol = x.symbol;
      entity.lo = x.resistanceLo;
      entity.hi = x.resistanceHi;
      return entity;
    });

    const insertResult = await m.createQueryBuilder()
      .insert()
      .into(StockSupport)
      .values(insertEntities)
      .execute();

    console.log('Moved from resistance to support', JSON.stringify(insertResult));
  });
}

start(JOB_NAME, async () => {
  // const isMarketOpen = await isUSMarketOpen();
  // if (isMarketOpen) {
  //   console.warn('Market is still open');
  //   return;
  // }

  const JOB_IN_PROGRESS = `JOBKEY_${JOB_NAME}`;
  const acquired = await redisCache.acquireLock(JOB_IN_PROGRESS, JOB_LOCK_TTL_SECONDS);
  if (!acquired) {
    console.log('Other process is still running, skip this run');
    return;
  }

  try {
    const sleepTime = 60 * 1000 / MAX_CALL_TIMES_PER_MINUTE;

    const stocks = await getRepository(Stock)
      .createQueryBuilder('s')
      .innerJoin(q => q.from(StockDailyClose, 'c')
        .distinctOn(['symbol'])
        .orderBy('symbol', 'DESC')
        .addOrderBy('date', 'DESC'),
      'c', 's.symbol = c.symbol')
      .where('c.date < CURRENT_DATE')
      .select('s.symbol as symbol')
      .orderBy('s.symbol', 'ASC')
      .execute();
    const symbols = stocks.map(s => s.symbol);

    let count = 0;
    const failed = [];
    for await (const symbol of symbols) {
      await redisCache.renewLock(JOB_IN_PROGRESS, JOB_LOCK_TTL_SECONDS);
      try {
        await syncStockHistoricalClose(symbol, 10);
        console.log(JOB_NAME, symbol, `${++count}/${symbols.length} done`);
        await delay(sleepTime);
      } catch (e) {
        const errorJson = errorToJson(e);
        const msg = `${JOB_NAME} ${symbol} ${++count}/${symbols.length} failed`;
        console.error(msg.red, errorJson);
        failed.push(msg + JSON.stringify(errorJson));
      }
    }

    // Scrub supports and resistance
    console.log('Scrubing supports');
    await scrubSupports();
    console.log('Scrubing resistance');
    await scrubResistances();

    await executeWithDataEvents('refresh materialized views', JOB_NAME, refreshMaterializedView, { eventId });

    await handleWatchlistSupportResistanceChangedNotification();
    await handleWatchlistFairValueChangedNotification();

    for (const err of failed) {
      console.error(err);
    }
  } finally {
    await redisCache.del(JOB_IN_PROGRESS);
  }
}, { eventId });

