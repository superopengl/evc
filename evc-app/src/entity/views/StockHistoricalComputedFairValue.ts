import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockHistoricalTtmEps as StockHistoricalTtmEps } from './StockHistoricalTtmEps';

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
          'UNNEST(ARRAY["reportDate", "reportDate" + 30, "reportDate" + 60]) as "reportDate"'
        ]),
        'eps', 's.symbol = eps.symbol')
      .leftJoin(StockComputedPe90, 'pe', 's.symbol = pe.symbol AND pe.date <= eps."reportDate"')
      .where('eps."reportDate" <= CURRENT_DATE')
      .select([
        's.symbol as symbol',
        'eps."reportDate" as "reportDate"',
        'eps."ttmEps" as "ttmEps"',
        'pe.pe as pe',
        'pe."pe90Avg" as "pe90Avg"',
        'pe."pe90StdDev" as "pe90StdDev"',
        'pe.date as "peDate"',
        'pe."peLo" as "peLo"',
        'pe."peHi" as "peHi"',
        'pe."fairValueLo" as "fairValueLo"',
        'pe."fairValueHi" as "fairValueHi"',
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
}

