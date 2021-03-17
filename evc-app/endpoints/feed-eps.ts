import { getRepository } from 'typeorm';
import { refreshMaterializedView } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { syncStockEps } from '../src/services/stockEpsService';
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as sleep from 'sleep-promise';

const JOB_NAME = 'stock-eps';

const MAX_CALL_TIMES_PER_MINUTE = 4;

start(JOB_NAME, async () => {
  const sleepTime = 60 * 1000 / MAX_CALL_TIMES_PER_MINUTE;
  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);

  let count = 0;
  for await(const symbol of symbols) {
        await syncStockEps(symbol);
        console.log(JOB_NAME, symbol, `${++count}/${symbols.length} done`);
        await sleep(sleepTime);
  }

  await executeWithDataEvents('refresh materialized views', JOB_NAME, refreshMaterializedView);
});
