import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { isUSMarketOpen, singleBatchRequest } from '../src/services/iexService';
import { StockAdvancedStatsInfo, syncManyStockPutCallRatio } from '../src/services/stockPutCallRatioService';
import * as moment from 'moment';
import { refreshMaterializedView } from '../src/db';
import { executeWithDataEvents } from '../src/services/dataLogService';
import * as _ from 'lodash';
import { StockPutCallRatio90 } from '../src/entity/views/StockPutCallRatio90';

async function udpateDatabase(iexBatchResponse) {
  const advancedStatsInfo: StockAdvancedStatsInfo[] = [];
  for (const [symbol, value] of Object.entries(iexBatchResponse)) {
    // advanced-stats
    const advancedStats = value['advanced-stats'];
    advancedStatsInfo.push({
      symbol,
      putCallRatio: advancedStats.putCallRatio,
      date: moment().format('YYYY-MM-DD'),
      rawResponse: advancedStats
    });
  }

  await syncManyStockPutCallRatio(advancedStatsInfo);
}


async function syncIexForSymbols(symbols: string[]) {
  const types = ['advanced-stats'];
  const params = { last: 1 };
  const resp = await singleBatchRequest(symbols, types, params);
  await udpateDatabase(resp);
}

const JOB_NAME = 'daily-putCallRatio';

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
  for(const batchSymbols of chunks) {
    console.log(JOB_NAME, `${++round}/${chunks.length}`);
    await syncIexForSymbols(batchSymbols);
  }

  await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView(StockPutCallRatio90));
});
