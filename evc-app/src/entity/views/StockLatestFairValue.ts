import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockSpecialFairValue } from '../StockSpecialFairValue';
import { StockHistoricalComputedFairValue } from './StockHistoricalComputedFairValue';
import { StockComputedPe365 } from './StockComputedPe365';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Stock, 's')
    .leftJoin(q => q.from(StockComputedPe365, 'pe')
      .distinctOn([
        'symbol'
      ])
      .orderBy('symbol')
      .addOrderBy('"date"', 'DESC'),
      'pe', 's.symbol = pe.symbol')
    .leftJoin(q => q.from(StockHistoricalComputedFairValue, 'sc')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('"reportDate"', 'DESC'),
      'sc', 's.symbol = sc.symbol')
    .leftJoin(q => q
      .from(StockSpecialFairValue, 'sp')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('"reportDate"', 'DESC'),
      'sp', 'sp.symbol = s.symbol AND (sc."reportDate" IS NULL OR sc."reportDate" <= sp."reportDate")')
    .select([
      's.symbol as symbol',
      'COALESCE(sp."reportDate", sc."reportDate") as "reportDate"',
      'pe.date as "peDate"',
      'pe."pe90Avg" as "pe90Avg"',
      'pe."pe90StdDev" as "pe90StdDev"',
      'pe."forwardEps" as "peForwardEps"',
      'sp."createdAt" as "specialCreatedAt"',
      'sc."ttmEps" as "ttmEps"',
      'sc."fairValueLo" as "computedFairValueLo"',
      'sc."fairValueHi" as "computedFairValueHi"',
      'COALESCE(sp."fairValueLo", sc."fairValueLo") as "fairValueLo"',
      'COALESCE(sp."fairValueHi", sc."fairValueHi") as "fairValueHi"',
      '(pe."pe90Avg" -  pe."pe90StdDev") * pe."forwardEps" as "forwardNextFyFairValueLo"',
      '(pe."pe90Avg" +  pe."pe90StdDev") * pe."forwardEps" as "forwardNextFyFairValueHi"',
      'pe."peYrLo" * pe."forwardEps" as "forwardNextFyMaxValueLo"',
      'pe."peYrHi" * pe."forwardEps" as "forwardNextFyMaxValueHi"',
      'pe.beta as beta',
      'pe."peRatio" as "peRatio"',
      'pe."forwardPeRatio" as "forwardPeRatio"',
    ])
})
export class StockLatestFairValue {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDate: string;

  @ViewColumn()
  peDate: string;

  @ViewColumn()
  pe90Avg: number;

  @ViewColumn()
  pe90StdDev: number;

  @ViewColumn()
  peForwardEps: number;

  @ViewColumn()
  specialCreatedAt: Date;

  @ViewColumn()
  ttmEps: number;

  @ViewColumn()
  computedFairValueLo: number;

  @ViewColumn()
  computedFairValueHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  forwardNextFyFairValueLo: number;

  @ViewColumn()
  forwardNextFyFairValueHi: number;

  @ViewColumn()
  forwardNextFyMaxValueLo: number;

  @ViewColumn()
  forwardNextFyMaxValueHi: number;

  @ViewColumn()
  beta: number;

  @ViewColumn()
  peRatio: number;

  @ViewColumn()
  forwardPeRatio: number;
}
