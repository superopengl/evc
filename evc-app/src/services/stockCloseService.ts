import { StockLastPrice } from './../entity/StockLastPrice';
import { getManager, getRepository } from 'typeorm';
import { StockDailyClose } from '../entity/StockDailyClose';
import { getHistoricalClose } from './alphaVantageService';
import { syncStockLastPrice } from '../utils/syncStockLastPrice';


export type StockCloseInfo = {
  symbol: string;
  close: number;
  date: string;
};

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

  const closeOfToday = closeEntities[0];
  const lastPrice = new StockLastPrice();
  lastPrice.symbol = symbol;
  lastPrice.price = closeOfToday.close;

  if (closeOfToday) {
    await getManager().transaction(async m => {
      await m.createQueryBuilder()
        .insert()
        .into(StockDailyClose)
        .orIgnore()
        .values(closeEntities)
        .execute();

      await syncStockLastPrice(m, lastPrice);
    });

    console.log(`Synced close for ${symbol} with ${closeOfToday.date}/${closeOfToday.close} and more.`);
  }
}

