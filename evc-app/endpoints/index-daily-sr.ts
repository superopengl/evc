import { getRepository, getManager } from 'typeorm';
import { start } from './jobStarter';
import { isUSMarketOpen } from '../src/services/iexService';
import { refreshMaterializedView } from '../src/db';
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as _ from 'lodash';
import { StockPutCallRatio90 } from '../src/entity/views/StockPutCallRatio90';
import { StockSupport } from '../src/entity/StockSupport';
import { StockLatestFairValue } from '../src/entity/views/StockLatestFairValue';
import { StockDeprecateSupport } from '../src/entity/views/StockDeprecateSupport';
import { StockDeprecateResistance } from '../src/entity/views/StockDeprecateResistance';
import { StockResistance } from '../src/entity/StockResistance';

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


const JOB_NAME = 'daily-support-resistance';

start(JOB_NAME, async () => {

  const isMarketOpen = await isUSMarketOpen();
  if (isMarketOpen) {
    console.warn('Market is still open');
    return;
  }

  await scrubSupports();
  await scrubResistances();

  await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView(StockPutCallRatio90));
});
