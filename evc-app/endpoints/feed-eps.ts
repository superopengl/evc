import { getManager, getRepository } from 'typeorm';
import { refreshMaterializedView } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { syncStockEps } from '../src/services/stockEpsService';
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as delay from 'delay';
import errorToJson from 'error-to-json';
import { StockResistance } from '../src/entity/StockResistance';
import { StockSupport } from '../src/entity/StockSupport';
import { StockDeprecateResistance } from '../src/entity/views/StockDeprecateResistance';
import { StockDeprecateSupport } from '../src/entity/views/StockDeprecateSupport';
import { CoreDataPreviousSnapshot } from '../src/entity/CoreDataPreviousSnapshot';
import { CoreDataLatestSnapshot } from '../src/entity/views/CoreDataLatestSnapshot';
import { CoreDataWatchlistEmailTask } from '../src/entity/views/CoreDataWatchlistEmailTask';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import * as moment from 'moment';
import { redisCache } from '../src/services/redisCache';

const JOB_NAME = 'feed-eps';

const MAX_CALL_TIMES_PER_MINUTE = 300; // 300 calls/min

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
    })

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

async function sendCoreDataChangedEmails() {
  const list = await getRepository(CoreDataWatchlistEmailTask).find();

  for (const item of list) {
    await sendEmailByRow(item);
  }
}

async function sendEmailByRow(item: CoreDataWatchlistEmailTask) {
  const { email, givenName, surname, symbol } = item;
  const name = `${givenName || ''} ${surname || ''}`.trim() || 'Client';
  await enqueueEmail({
    to: email,
    template: EmailTemplateType.WatchlistCoreDataChangedEmail,
    shouldBcc: false,
    vars: {
      toWhom: name,
      symbol,
    }
  });
}

async function promoteLatestSnapshotToPreviousSnapshot() {
  const { tableName: fromTableName, schema: fromSchema } = getRepository(CoreDataLatestSnapshot).metadata;
  const { tableName: toTableName, schema: toSchema } = getRepository(CoreDataPreviousSnapshot).metadata;

  await getManager().transaction(async m => {
    await m.delete(CoreDataPreviousSnapshot, {});
    const sql = `INSERT INTO "${toSchema}"."${toTableName}" SELECT * FROM "${fromSchema}"."${fromTableName}"`;
    await m.query(sql);
  });
}

start(JOB_NAME, async () => {
  const JOB_IN_PROGRESS = `JOBKEY_${JOB_NAME}`;
  const running = await redisCache.get(JOB_IN_PROGRESS);
  if (running) {
    console.log('Other job is still running, skip this run');
    return;
  }
  await redisCache.set(JOB_IN_PROGRESS, true);

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

    // Scrub supports and resistance
    console.log(`Scrubing supports`)
    await scrubSupports();
    console.log(`Scrubing resistance`)
    await scrubResistances();

    // Send watchlist emails if core data change detected.
    console.log(`Sending watchlist core change emails`)
    await sendCoreDataChangedEmails();
    await promoteLatestSnapshotToPreviousSnapshot();
  } finally {
    await redisCache.del(JOB_IN_PROGRESS);
  }
});
