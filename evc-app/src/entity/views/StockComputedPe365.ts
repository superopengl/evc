import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { existsQuery } from '../../utils/existsQuery';
import { StockDailyPe } from './StockDailyPe';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockDailyAdvancedStat } from '../StockDailyAdvancedStat';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q.from(StockComputedPe90, 'pe')
      .innerJoin(StockComputedPe90, 'back', 'pe.symbol = back.symbol')
      .where('back.date between pe."date" - 365 and pe."date"')
      // .andWhere(`exists(select 1 from evc.stock_all_computed_pe sdp where sdp.date = pe."date" - 90)`)
      .groupBy('pe.symbol')
      .addGroupBy('pe.date')
      .addGroupBy('pe.close')
      .addGroupBy('pe."ttmEps"')
      .addGroupBy('pe.pe')
      .addGroupBy('pe."pe90Avg"')
      .addGroupBy('pe."pe90StdDev"')
      .addGroupBy('pe."fairValueLo"')
      .addGroupBy('pe."fairValueHi"')
      .select([
        'pe.symbol as symbol',
        'pe.date as date',
        'pe.close as close',
        'pe."ttmEps" as "ttmEps"',
        'pe.pe as pe',
        'pe."pe90Avg" as "pe90Avg"',
        'pe."pe90StdDev" as "pe90StdDev"',
        'pe."fairValueLo" as "fairValueLo"',
        'pe."fairValueHi" as "fairValueHi"',
        'min(back.pe) as "peYrLo"',
        'max(back.pe) as "peYrHi"'
      ])
      , 'x')
    .leftJoin(StockDailyAdvancedStat, 'a', 'x.symbol = a.symbol AND x.date = a.date')
    .select([
      'x.symbol',
      'x.date',
      'x.close',
      'x."ttmEps"',
      'x.pe',
      'x."pe90Avg" as "pe90Avg"',
      'x."pe90StdDev" as "pe90StdDev"',
      'x."peYrLo" as "peYrLo"',
      'x."peYrHi" as "peYrHi"',
      'x."ttmEps" * (x."pe90Avg" - x."pe90StdDev") as "fairValueLo"',
      'x."ttmEps" * (x."pe90Avg" + x."pe90StdDev") as "fairValueHi"',
      'a.beta as beta',
      'a."peRatio" as "peRatio"',
      'a."pegRatio" as "pegRatio"',
      'x."ttmEps" * (1 + x.pe / a."pegRatio") as "forwardEps"',
    ])
})
export class StockComputedPe365 {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  close: number;

  @ViewColumn()
  ttmEps: number;

  @ViewColumn()
  pe: number;

  @ViewColumn()
  pe90Avg: number;

  @ViewColumn()
  pe90StdDev: number;

  @ViewColumn()
  peYrLo: number;

  @ViewColumn()
  peYrHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  beta: number;

  @ViewColumn()
  peRatio: number;

  @ViewColumn()
  pegRatio: number;

  @ViewColumn()
  forwardEps: number;
}


