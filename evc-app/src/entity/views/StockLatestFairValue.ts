import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockSpecialFairValue } from '../StockSpecialFairValue';
import { StockHistoricalComputedFairValue } from './StockHistoricalComputedFairValue';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q.from(StockHistoricalComputedFairValue, 's')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('"reportDate"', 'DESC'),
    's')
    .leftJoin(q => q
      .from(StockSpecialFairValue, 'sp')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('"reportDate"', 'DESC'),
    'sp', 'sp.symbol = s.symbol AND s."reportDate" <= sp."reportDate"')
    .select([
      's.symbol as symbol',
      's."reportDate" as "reportDate"',
      'sp."createdAt" as "specialCreatedAt"',
      's."ttmEps" as "ttmEps"',
      's."fairValueLo" as "computedFairValueLo"',
      's."fairValueHi" as "computedFairValueHi"',
      'COALESCE(sp."fairValueLo", s."fairValueLo") as "fairValueLo"',
      'COALESCE(sp."fairValueHi", s."fairValueHi") as "fairValueHi"',
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
