import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockHistoricalTtmEps as StockHistoricalTtmEps } from './StockHistoricalTtmEps';
import { StockComputedPe365 } from './StockComputedPe365';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q
      .from(Stock, 's')
      .leftJoin(q => q
        .from(StockHistoricalTtmEps, 'subeps')
        .select([
          'symbol',
          '"ttmEps"',
          `UNNEST(ARRAY["reportDate"]) as "reportDate"`
        ]),
        'eps', 's.symbol = eps.symbol')
      .leftJoin(StockComputedPe365, 'pe', 's.symbol = pe.symbol AND pe."date" <= eps."reportDate"')
      .where('eps."reportDate" <= CURRENT_DATE')
      .select([
        's.symbol as symbol',
        'eps."reportDate" as "reportDate"',
        'eps."ttmEps" as "ttmEps"',
        'pe.pe as pe',
        'pe."pe90Avg" as "pe90Avg"',
        'pe."pe90StdDev" as "pe90StdDev"',
        'pe.date as "peDate"',
        'pe."peYrLo" as "peLo"',
        'pe."peYrHi" as "peHi"',
        'CASE WHEN pe."fairValueLo" <=0 THEN NULL WHEN pe."fairValueLo" >= pe.close * 1.2 THEN pe.close * 0.95 ELSE pe."fairValueLo" END as "fairValueLo"',
        'CASE WHEN pe."fairValueLo" <=0 THEN NULL WHEN pe."fairValueLo" >= pe.close * 1.2 THEN pe.close * 1.2 ELSE pe."fairValueHi" END as "fairValueHi"',
        'CASE WHEN pe."fairValueLo" >= pe.close * 1.2 THEN TRUE ELSE FALSE END as "isAdjustedFairValue"',
      ]), 'sub')
    .distinctOn([
      'symbol',
      '"reportDate"'
    ])
    .orderBy('"symbol"', 'ASC')
    .addOrderBy('"reportDate"', 'DESC')
    .addOrderBy('"peDate"', 'DESC')
})
export class StockHistoricalComputedFairValue {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDate: string;

  @ViewColumn()
  ttmEps: number;

  @ViewColumn()
  pe: number;

  @ViewColumn()
  pe90Avg: number;

  @ViewColumn()
  pe90StdDev: number;

  @ViewColumn()
  peDate: string;

  @ViewColumn()
  peLo: number;

  @ViewColumn()
  peHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  isAdjustedFairValue: boolean;
}

