import { ViewEntity, Connection } from 'typeorm';
import { StockDerivedFairValue } from './StockDerivedFairValue';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockDerivedFairValue, 'x')
    .select('*')
    .distinctOn(['symbol'])
    .orderBy('symbol')
    .addOrderBy('date', 'DESC')
})
export class StockLastFairValue extends StockDerivedFairValue {
}
