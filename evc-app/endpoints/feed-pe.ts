import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager, getRepository } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { getLastThreeMonthDailyPrice, singleBatchRequest } from '../src/services/iexService';
import { StockClose } from '../src/entity/StockClose';


async function syncManyStockClose(closeEntities: StockClose[]) {
  if (closeEntities.length) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(StockClose)
      .onConflict('("symbol", "date") DO NOTHING')
      .values(closeEntities)
      .execute();
  }
}

async function udpateDatabase(iexBatchResponse) {
  const closeEntities: StockClose[] = [];
  for (const [symbol, value] of Object.entries(iexBatchResponse)) {
    const { chart } = value as any;
    if (symbol && chart?.length) {
      for (const p of chart) {
        const stockClose = new StockClose();
        stockClose.symbol = symbol;
        stockClose.date = p.date;
        stockClose.close = p.close;
        closeEntities.push(stockClose);
      }
    }
  }

  await syncManyStockClose(closeEntities);
}

async function syncIexToDatabase(symbols: string[]) {
  const types = ['chart'];
  const params = { range: '4m' };
  const resp = await singleBatchRequest(symbols, types, params);
  await udpateDatabase(resp);
}

const JOB_NAME = 'stock-historical-pe';

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
});
