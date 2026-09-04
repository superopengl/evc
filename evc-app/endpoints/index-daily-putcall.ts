import { getRepository } from '../src/dataSource';
import errorToJson from 'error-to-json';

import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { StockAdvancedStatsInfo, syncManyStockAdcancedStat } from '../src/services/syncManyStockAdcancedStat';
import moment from 'moment';
import _ from 'lodash';
import { getAdvancedStat, isUSMarkertOpenNow } from '../src/services/alphaVantageService';
import { mapWithRateLimit } from '../src/utils/mapWithRateLimit';

// Same API key as feed-eps, which already runs at this budget.
const MAX_CALL_TIMES_PER_MINUTE = 300;
// Enough in flight to keep hitting the budget when a call is slow, but the
// budget above is what actually caps the request rate.
const CONCURRENCY = 10;

async function syncForSymbols(symbols: string[]) {
  const advancedStatsInfo: StockAdvancedStatsInfo[] = [];

  await mapWithRateLimit(symbols, { maxPerMinute: MAX_CALL_TIMES_PER_MINUTE, concurrency: CONCURRENCY }, async symbol => {
    try {
      const value = await getAdvancedStat(symbol);

      advancedStatsInfo.push({
        symbol,
        beta: +value.Beta || null,
        peRatio: +value.TrailingPE || null,
        forwardPeRatio: +value.ForwardPE || null,
        date: moment().format('YYYY-MM-DD'),
        rawResponse: value
      });
    } catch (e) {
      console.error(`Failed to fetch advanced stat info for ${symbol}`, errorToJson(e));
    }
  });

  if (advancedStatsInfo.length) {
    await syncManyStockAdcancedStat(advancedStatsInfo);
  }
}

const JOB_NAME = 'daily-advancedStat';

start(JOB_NAME, async () => {

  const isMarketOpen = await isUSMarkertOpenNow();
  if (isMarketOpen) {
    console.warn('Market is still open');
    return;
  }

  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);

  const batchSize = 100;
  let round = 0;
  const chunks = _.chunk(symbols, batchSize);
  for (const batchSymbols of chunks) {
    console.log(JOB_NAME, `${++round}/${chunks.length}`);
    await syncForSymbols(batchSymbols);
  }

  // await backfillDataFromOldStockDailyPutCallRatioTable();

  // await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView());
});
