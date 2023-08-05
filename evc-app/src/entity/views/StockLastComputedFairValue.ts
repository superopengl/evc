import { ViewEntity, Connection } from 'typeorm';
import { StockAllComputedFairValue } from './StockAllComputedFairValue';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockAllComputedFairValue, 'x')
    .select('*')
    .distinctOn(['symbol'])
    .orderBy('symbol')
    .addOrderBy('date', 'DESC')
})
export class StockLastComputedFairValue extends StockAllComputedFairValue {
}
