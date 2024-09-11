import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { isUSMarketOpen } from '../src/services/iexService';
import { sendIexRequest } from '../src/services/iexCoreService';
import { StockAdvancedStatsInfo, syncManyStockAdcancedStat } from '../src/services/stockPutCallRatioService';
import * as moment from 'moment';
import { refreshMaterializedView } from "../src/refreshMaterializedView";
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as _ from 'lodash';
import { StockPutCallRatio90 } from '../src/entity/views/StockPutCallRatio90';

async function udpateDatabase(symbolValueMap) {
  const advancedStatsInfo: StockAdvancedStatsInfo[] = [];
  for (const [symbol, value] of symbolValueMap) {
    // advanced-stats
    advancedStatsInfo.push({
      symbol,
      putCallRatio: value.putCallRatio,
      beta: value.bata,
      peRatio: value.peRatio,
      pegRatio: value.pegRatio,
      date: moment().format('YYYY-MM-DD'),
      rawResponse: value
    });
  }

  await syncManyStockAdcancedStat(advancedStatsInfo);
}


async function syncIexForSymbols(symbols: string[]) {
  const map = await sendIexRequest(symbols, 'advanced_stats');
  await udpateDatabase(map);
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

  await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView(StockPutCallRatio90));
});
