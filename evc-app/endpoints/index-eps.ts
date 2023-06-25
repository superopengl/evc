import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager, getRepository } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import * as iexService from '../src/services/iexService';
import { StockIexEpsInfo, syncManyStockEps } from '../src/services/stockEpsService';

start('stock-eps', async () => {
  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);
  const result = await iexService.batchRequest(symbols, ['earnings'], { last: 4 });

  const epsInfo: StockIexEpsInfo[] = [];
  for (const item of Object.values(result)) {
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
});
