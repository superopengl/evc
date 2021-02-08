import { ViewEntity, Connection } from 'typeorm';
import { StockComputedPe90 } from './StockComputedPe90';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockComputedPe90, 'x')
    .select('*')
    .distinctOn(['symbol'])
    .orderBy('symbol')
    .addOrderBy('date', 'DESC')
})
export class StockLastComputedFairValue extends StockComputedPe90 {
}
