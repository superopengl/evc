import { StockLastPrice } from '../entity/StockLastPrice';
import { EntityManager } from 'typeorm';


export async function syncStockLastPrice(m: EntityManager, entity: StockLastPrice | StockLastPrice[]) {
  await m.createQueryBuilder()
    .insert()
    .into(StockLastPrice)
    // updatedAt is an @UpdateDateColumn, so EXCLUDED."updatedAt" reproduces `= now()`.
    .orUpdate(['price', 'change', 'changePercent', 'updatedAt'], ['symbol'])
    .values(entity)
    .execute();
}
