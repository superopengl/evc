import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { StockAdvancedStatsInfo, syncManyStockAdcancedStat } from '../src/services/syncManyStockAdcancedStat';
import moment from 'moment';
import _ from 'lodash';
import { getAdvancedStat, isUSMarkertOpenNow } from '../src/services/alphaVantageService';

async function syncIexForSymbols(symbols: string[]) {
  const advancedStatsInfo: StockAdvancedStatsInfo[] = [];
  for (const symbol of symbols) {
    const value = await getAdvancedStat(symbol);

    advancedStatsInfo.push({
      symbol,
      beta: +value.Beta || null,
      peRatio: +value.TrailingPE || null,
      forwardPeRatio: +value.ForwardPE || null,
      date: moment().format('YYYY-MM-DD'),
      rawResponse: value
    });
  }

  await syncManyStockAdcancedStat(advancedStatsInfo);
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
    await syncIexForSymbols(batchSymbols);
  }

  // await backfillDataFromOldStockDailyPutCallRatioTable();

  // await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView());
});
