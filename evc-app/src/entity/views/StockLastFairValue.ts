import { ViewEntity, Connection } from 'typeorm';
import { StockAllFairValue } from './StockAllFairValue';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockAllFairValue, 'x')
    .select('*')
    .distinctOn(['symbol'])
    .orderBy('symbol')
    .addOrderBy('date', 'DESC')
})
export class StockLastFairValue extends StockAllFairValue {
}
