import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { isUSMarketOpen } from '../src/services/iexService';
import { refreshMaterializedView } from '../src/db';
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as _ from 'lodash';
import * as sleep from 'sleep-promise';
import errorToJson from 'error-to-json';
import {syncStockHistoricalClose} from '../src/services/stockCloseService';

const JOB_NAME = 'feed-historical-close';
const MAX_CALL_TIMES_PER_MINUTE = 50;

start(JOB_NAME, async () => {
  const isMarketOpen = await isUSMarketOpen();
  if (isMarketOpen) {
    console.warn('Market is still open');
    return;
  }
  
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
      await syncStockHistoricalClose(symbol, 10);
      console.log(JOB_NAME, symbol, `${++count}/${symbols.length} done`);
      await sleep(sleepTime);
    } catch (e) {
      const errorJson = errorToJson(e);
      const msg = `${JOB_NAME} ${symbol} ${++count}/${symbols.length} failed`
      console.error(msg.red, errorJson);
      failed.push(msg + JSON.stringify(errorJson));
    }
  }

  await executeWithDataEvents('refresh materialized views', JOB_NAME, refreshMaterializedView);

  for (const err of failed) {
    console.error(err);
  }
});

