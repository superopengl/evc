import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockSpecialFairValue } from '../StockSpecialFairValue';
import { StockHistoricalComputedFairValue } from './StockHistoricalComputedFairValue';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Stock, 's')
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
      'sp."createdAt" as "specialCreatedAt"',
      'sc."ttmEps" as "ttmEps"',
      'sc."fairValueLo" as "computedFairValueLo"',
      'sc."fairValueHi" as "computedFairValueHi"',
      'COALESCE(sp."fairValueLo", sc."fairValueLo") as "fairValueLo"',
      'COALESCE(sp."fairValueHi", sc."fairValueHi") as "fairValueHi"',
    ])
})
export class StockLatestFairValue {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDate: string;

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
}
