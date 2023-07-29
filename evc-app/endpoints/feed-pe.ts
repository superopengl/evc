import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager, getRepository } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { getLastThreeMonthDailyPrice, singleBatchRequest } from '../src/services/iexService';
import { StockIexEpsInfo, syncManyStockEps, syncStockEps } from '../src/services/stockEpsService';
import { StockClose } from '../src/entity/StockClose';


async function feedHistoricalPeFor(symbol: string) {
  const historicalDailyPrices = await getLastThreeMonthDailyPrice(symbol);
  const historicalDailyCloses: StockClose[] = historicalDailyPrices.map(p => {
    const stockClose = new StockClose();
    stockClose.symbol = symbol;
    stockClose.date = p.date;
    stockClose.close = p.close;
    return stockClose;
  });

  if (historicalDailyCloses.length) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(StockClose)
      .onConflict(`("symbol", "date") DO NOTHING`)
      .values(historicalDailyCloses)
      .execute();
  }
}

const JOB_NAME = 'stock-historical-pe';

start(JOB_NAME, async () => {
  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    // .where(`symbol = 'AAPL'`)
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);

  for (const symbol of symbols) {
    await feedHistoricalPeFor(symbol);
  }

  process.exit();
});
