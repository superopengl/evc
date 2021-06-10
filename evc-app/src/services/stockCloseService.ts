import { getManager } from 'typeorm';
import { StockDailyClose } from '../entity/StockDailyClose';
import { getHistoricalClose } from './alphaVantageService';


export type StockCloseInfo = {
  symbol: string;
  close: number;
  date: string;
}

export async function syncManyStockClose(info: StockCloseInfo[]) {
  const entites = info.map(item => {
    const { symbol, close, date } = item;
    if(!close) {
      return null;
    }

    const entity = new StockDailyClose();
    entity.symbol = symbol;
    entity.close = close;
    entity.date = date;
    return entity;
  }).filter(x => !!x);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockDailyClose)
    .values(entites)
    .orIgnore()
    .execute();
}

export async function syncStockHistoricalClose(symbol: string, days = 100) {
  const data = await getHistoricalClose(symbol, days);
  if (!data?.length) {
    return;
  }
  const closeEntities = [];
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
}
