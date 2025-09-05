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
          `UNNEST(ARRAY[
"reportDate", 
"reportDate" + 1,
"reportDate" + 2,
"reportDate" + 3,
"reportDate" + 4,
"reportDate" + 5,
"reportDate" + 6,
"reportDate" + 7,
"reportDate" + 8,
"reportDate" + 9,
"reportDate" + 10,
"reportDate" + 11,
"reportDate" + 12,
"reportDate" + 13,
"reportDate" + 14,
"reportDate" + 15,
"reportDate" + 16,
"reportDate" + 17,
"reportDate" + 18,
"reportDate" + 19,
"reportDate" + 20,
"reportDate" + 21,
"reportDate" + 22,
"reportDate" + 23,
"reportDate" + 24,
"reportDate" + 25,
"reportDate" + 26,
"reportDate" + 27,
"reportDate" + 28,
"reportDate" + 29,
"reportDate" + 30,
"reportDate" + 31,
"reportDate" + 32,
"reportDate" + 33,
"reportDate" + 34,
"reportDate" + 35,
"reportDate" + 36,
"reportDate" + 37,
"reportDate" + 38,
"reportDate" + 39,
"reportDate" + 40,
"reportDate" + 41,
"reportDate" + 42,
"reportDate" + 43,
"reportDate" + 44,
"reportDate" + 45,
"reportDate" + 46,
"reportDate" + 47,
"reportDate" + 48,
"reportDate" + 49,
"reportDate" + 50,
"reportDate" + 51,
"reportDate" + 52,
"reportDate" + 53,
"reportDate" + 54,
"reportDate" + 55,
"reportDate" + 56,
"reportDate" + 57,
"reportDate" + 58,
"reportDate" + 59,
"reportDate" + 60
          ]) as "reportDate"`
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

