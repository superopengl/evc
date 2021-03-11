import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { singleBatchRequest } from '../src/services/iexService';
import { StockIexEpsInfo, syncManyStockEps } from '../src/services/stockEpsService';
import { StockAdvancedStatsInfo, syncManyStockPutCallRatio } from '../src/services/sockPutCallRatioService';
import { StockCloseInfo, syncManyStockClose } from '../src/services/sockCloseService';
import * as moment from 'moment';
import { refreshMaterializedView } from '../src/db';
import { executeWithDataEvents, logDataEvent } from '../src/services/dataLogService';
import { v4 as uuidv4 } from 'uuid';

async function udpateDatabase(iexBatchResponse) {
  const epsInfo: StockIexEpsInfo[] = [];
  const advancedStatsInfo: StockAdvancedStatsInfo[] = [];
  const quoteInfo: StockCloseInfo[] = [];
  for (const [symbol, value] of Object.entries(iexBatchResponse)) {
    // advanced-stats
    const advancedStats = value['advanced-stats'];
    advancedStatsInfo.push({
      symbol,
      putCallRatio: advancedStats.putCallRatio,
      date: moment().format('YYYY-MM-DD'),
      rawResponse: advancedStats
    });

    // earnings
    const { earnings } = value['earnings'];
    if (symbol && earnings?.length) {
      for (const earning of earnings) {
        epsInfo.push({
          symbol,
          fiscalPeriod: earning.fiscalPeriod,
          reportDate: earning.EPSReportDate,
          value: earning.actualEPS,
        });
      }
    }

    // quote
    const { close, closeTime } = value['quote'];
    quoteInfo.push({
      symbol,
      close,
      date: moment(closeTime).format('YYYY-MM-DD')
    })
  }

  await syncManyStockEps(epsInfo);
  await syncManyStockPutCallRatio(advancedStatsInfo);
  await syncManyStockClose(quoteInfo);
}


async function syncIexToDatabase(symbols: string[]) {
  const types = ['earnings', 'advanced-stats', 'quote'];
  const params = { last: 1 };
  const resp = await singleBatchRequest(symbols, types, params);
  await udpateDatabase(resp);
}

const JOB_NAME = 'daily-fatch';

start(JOB_NAME, async () => {
  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);

  const batchSize = 100;
  let round = 0;
  const total = Math.ceil(symbols.length / batchSize);

  let batchSymbols = [];
  for (const symbol of symbols) {
    batchSymbols.push(symbol);
    if (batchSymbols.length === batchSize) {
      console.log(JOB_NAME, `${++round}/${total}`);
      await syncIexToDatabase(batchSymbols);
      batchSymbols = [];
    }
  }

  if (batchSymbols.length > 0) {
    console.log(JOB_NAME, `${++round}/${total}`);
    await syncIexToDatabase(batchSymbols);
  }

  await executeWithDataEvents('refresh materialized views', JOB_NAME, refreshMaterializedView);
});
