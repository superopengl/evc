import { getManager, getRepository } from 'typeorm';
import { StockDailyClose } from '../entity/StockDailyClose';
import { getHistoricalClose } from './alphaVantageService';


export type StockCloseInfo = {
  symbol: string;
  close: number;
  date: string;
}

export async function syncStockHistoricalClose(symbol: string, days = 100) {
  const data = await getHistoricalClose(symbol, days);
  if (!data?.length) {
    console.log(`Skipped syncing close for ${symbol} as no return from the API`);
    return;
  }
  const closeEntities: StockDailyClose[] = [];
  for (const p of data) {
    const stockClose = new StockDailyClose();
    stockClose.symbol = symbol;
    stockClose.date = p.date;
    stockClose.close = p.close;
    closeEntities.push(stockClose);
  }

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockDailyClose)
    .orIgnore()
    .values(closeEntities)
    .execute();

  const priceOfToday = closeEntities[0];
  console.log(`Synced close for ${symbol} with ${priceOfToday.date}/${priceOfToday.close} and more.`);
}
