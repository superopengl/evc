import { StockLastPrice } from '../entity/StockLastPrice';
import { EntityManager } from 'typeorm';


export async function syncStockLastPrice(m: EntityManager, entity: StockLastPrice | StockLastPrice[]) {
  await m.createQueryBuilder()
    .insert()
    .into(StockLastPrice)
    .onConflict('(symbol) DO UPDATE SET price = excluded.price, change = excluded.change, "changePercent" = excluded."changePercent", "updatedAt" = now()')
    .values(entity)
    .execute();
}
