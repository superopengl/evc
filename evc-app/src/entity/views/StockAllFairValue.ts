import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockSpecialFairValue } from '../StockSpecialFairValue';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockLastTtmEps } from './StockLastTtmEps';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockComputedPe90, 'c')
    .leftJoin(StockSpecialFairValue, 's', `c.symbol = s.symbol AND c.date = s.date AND s."deletedAt" IS NULL`)
    .select([
      'c.symbol as symbol',
      'c.date as date',
      's.id as id',
      'c."ttmEps" as "ttmEps"',
      'c.pe as pe',
      'c."peLo" as "peLo"',
      'c."peHi" as "peHi"',
      'COALESCE(c."fairValueLo", s."fairValueLo") as "fairValueLo"',
      'COALESCE(c."fairValueHi", s."fairValueHi") as "fairValueHi"',
      's.published as published',
    ])
})
export class StockAllFairValue {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  id: string;

  @ViewColumn()
  ttmEps: number;

  @ViewColumn()
  pe: number;

  @ViewColumn()
  peLo: number;

  @ViewColumn()
  peHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  published: Date;
}
@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Stock, 's')
    .leftJoin(StockLastTtmEps, 'eps', `s.symbol = eps.symbol`)
    .leftJoin(q => q
      .from(StockComputedPe90, 'pe')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('date', 'DESC'),
      'pe', `s.symbol = pe.symbol`)
    .leftJoin(q => q
      .from(StockSpecialFairValue, 'sp')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('date', 'DESC'),
      'sp', 'sp.symbol = s.symbol')
    .select([
      `s.symbol as symbol`,
      `eps."reportDate" as "reportDate"`,
      `eps."ttmEps"`,
      `pe."fairValueLo" as "fairValueLo"`,
      `pe."fairValueHi" as "fairValueHi"`,
      `sp."fairValueLo" as "specialFairValueLo"`,
      `sp."fairValueHi" as "specialFairValueHi"`,
      `sp."author" as "specialAuthor"`,
      `sp."createdAt" as "specialCreatedAt"`,
    ])
})
export class StockFairValue {
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

  @ViewColumn()
  specialFairValueLo: number;

  @ViewColumn()
  specialFairValueHi: number;

  @ViewColumn()
  specialAuthor: string;

  @ViewColumn()
  specialCreatedAt: Date;
}