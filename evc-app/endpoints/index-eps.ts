import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager, getRepository } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { singleBatchRequest } from '../src/services/iexService';
import { StockIexEpsInfo, syncManyStockEps } from '../src/services/stockEpsService';


async function udpateDatabase(iexBatchResponse) {
  const epsInfo: StockIexEpsInfo[] = [];
  for (const item of Object.values(iexBatchResponse)) {
    const { symbol, earnings } = (item as any).earnings;
    if (symbol && earnings?.length) {
      for (const earning of earnings) {
        epsInfo.push({
          symbol,
          fiscalPeriod: earning.fiscalPeriod,
          value: earning.actualEPS,
        });
      }
    }
  }

  await syncManyStockEps(epsInfo);
}

async function syncIexToDatabase(symbols: string[]) {
  const types = ['earnings'];
  const params = { last: 4 };
  const resp = await singleBatchRequest(symbols, types, params);
  await udpateDatabase(resp);
}

const JOB_NAME = 'stock-eps';

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
