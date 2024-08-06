import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { isUSMarketOpen } from '../src/services/iexService';
import { StockAdvancedStatsInfo, syncManyStockAdcancedStat } from '../src/services/syncManyStockAdcancedStat';
import moment from 'moment';
import _ from 'lodash';
import { assert } from '../src/utils/assert';


async function udpateDatabase(symbolValueMap) {
  const advancedStatsInfo: StockAdvancedStatsInfo[] = [];
  for (const [symbol, value] of symbolValueMap) {
    // advanced-stats
    advancedStatsInfo.push({
      symbol,
      putCallRatio: value.putCallRatio,
      beta: value.beta,
      peRatio: value.peRatio,
      forwardPeRatio: value.forwardPERatio,
      date: moment().format('YYYY-MM-DD'),
      rawResponse: value
    });
  }

  await syncManyStockAdcancedStat(advancedStatsInfo);
}

const JOB_NAME = 'daily-advancedStat';

start(JOB_NAME, async () => {

  const isMarketOpen = await isUSMarketOpen();
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
