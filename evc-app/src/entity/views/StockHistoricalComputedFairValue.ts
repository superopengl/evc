import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockHistoricalTtmEps as StockHistoricalTtmEps } from './StockHistoricalTtmEps';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Stock, 's')
    .leftJoin(StockHistoricalTtmEps, 'eps', 's.symbol = eps.symbol')
    .leftJoin(StockComputedPe90, 'pe', 's.symbol = pe.symbol AND pe.date = eps."reportDate"')
    .select([
      's.symbol as symbol',
      'eps."reportDate" as "reportDate"',
      'eps."ttmEps"',
      'pe."fairValueLo" as "fairValueLo"',
      'pe."fairValueHi" as "fairValueHi"',
    ])
})
export class StockHistoricalComputedFairValue {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDate: string;

  @ViewColumn()
  ttmEps: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;
}

