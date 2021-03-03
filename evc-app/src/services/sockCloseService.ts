import { getManager } from 'typeorm';
import { StockDailyClose } from '../entity/StockDailyClose';

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
    .onConflict('(symbol, date) DO NOTHING')
    .execute();
}
