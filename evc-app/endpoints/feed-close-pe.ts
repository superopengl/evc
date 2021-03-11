import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { singleBatchRequest } from '../src/services/iexService';
import { StockDailyClose } from '../src/entity/StockDailyClose';


async function syncManyStockClose(closeEntities: StockDailyClose[]) {
  if (closeEntities.length) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(StockDailyClose)
      .onConflict('("symbol", "date") DO NOTHING')
      .values(closeEntities)
      .execute();
  }
}

async function udpateDatabase(iexBatchResponse) {
  const closeEntities: StockDailyClose[] = [];
  for (const [symbol, value] of Object.entries(iexBatchResponse)) {
    const { chart } = value as any;
    if (symbol && chart?.length) {
      for (const p of chart) {
        const stockClose = new StockDailyClose();
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
  const params = { range: '1y' };
  const resp = await singleBatchRequest(symbols, types, params);
  await udpateDatabase(resp);
}

const JOB_NAME = 'stock-historical-close-pe';

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
