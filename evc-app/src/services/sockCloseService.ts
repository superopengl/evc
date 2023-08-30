import { getManager } from 'typeorm';
import { StockClose } from '../entity/StockClose';

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

    const entity = new StockClose();
    entity.symbol = symbol;
    entity.close = close;
    entity.date = date;
    return entity;
  }).filter(x => !!x);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockClose)
    .values(entites)
    .onConflict('(symbol, date) DO NOTHING')
    .execute();
}
