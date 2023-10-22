import { getManager, getRepository } from 'typeorm';
import { refreshMaterializedView } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { syncStockEps } from '../src/services/stockEpsService';
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as delay from 'delay';
import errorToJson from 'error-to-json';
import { isUSMarketOpen } from '../src/services/iexService';
import { StockResistance } from '../src/entity/StockResistance';
import { StockSupport } from '../src/entity/StockSupport';
import { StockDeprecateResistance } from '../src/entity/views/StockDeprecateResistance';
import { StockDeprecateSupport } from '../src/entity/views/StockDeprecateSupport';
import { CoreDataPreviousSnapshot } from '../src/entity/CoreDataPreviousSnapshot';
import { CoreDataLatestSnapshot } from '../src/entity/views/CoreDataLatestSnapshot';
import { CoreDataWatchlistEmailTask } from '../src/entity/views/CoreDataWatchlistEmailTask';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';

const JOB_NAME = 'feed-eps';

const MAX_CALL_TIMES_PER_MINUTE = 290; // 300 calls/min

async function scrubSupports() {
  const list = await getRepository(StockDeprecateSupport).find();

  // Delete supports
  const ids = list.map(x => x.supportId);
  const result = await getManager()
    .createQueryBuilder()
    .delete()
    .from(StockSupport)
    .whereInIds(ids)
    .execute();
}

async function scrubResistances() {
  const list = await getRepository(StockDeprecateResistance).find();

  // Delete resistance
  const ids = list.map(x => x.resistanceId);
  const result = await getManager()
    .createQueryBuilder()
    .delete()
    .from(StockResistance)
    .whereInIds(ids)
    .execute();
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
  const sleepTime = 60 * 1000 / MAX_CALL_TIMES_PER_MINUTE;
  const stocks = await getRepository(Stock)
    .find({
      order: {
        symbol: 'ASC'
      },
      select: [
        'symbol'
      ]
    });
  const symbols = stocks.map(s => s.symbol);

  let count = 0;
  const failed = [];
  for await (const symbol of symbols) {
    try {
      await syncStockEps(symbol);
      console.log(JOB_NAME, symbol, `${++count}/${symbols.length} done`);
      await delay(sleepTime);
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
});
