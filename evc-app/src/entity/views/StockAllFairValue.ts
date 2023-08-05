import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockSpecialFairValue } from '../StockSpecialFairValue';
import { StockAllComputedFairValue } from './StockAllComputedFairValue';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockAllComputedFairValue, 'c')
    .leftJoin(StockSpecialFairValue, 's', `c.symbol = s.symbol AND c.date = s.date`)
    .select([
      'c.symbol as symbol',
      'c.date as date',
      'c."ttmEps" as "ttmEps"',
      'c.pe as pe',
      'c."peLo" as "peLo"',
      'c."peHi" as "peHi"',
      'COALESCE(c."fairValueLo", s."fairValueLo") as "fairValueLo"',
      'COALESCE(c."fairValueHi", s."fairValueHi") as "fairValueHi"',
      's.published as published'
    ])
})
export class StockAllFairValue {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

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
  special: boolean;

  @ViewColumn()
  published: Date;
}
