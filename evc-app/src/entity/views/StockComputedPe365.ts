import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockDailyAdvancedStat } from '../StockDailyAdvancedStat';
import { StockDailyPe } from './StockDailyPe';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
  .createQueryBuilder()
  .from(q => q.from(StockComputedPe90, 'pe')
    .leftJoin(StockDailyPe, 'yr', 'pe.symbol = yr.symbol AND yr.date BETWEEN pe.date - 365 AND pe.date')
    .groupBy('pe.symbol')
    .addGroupBy('pe.date')
    .addGroupBy('pe.close')
    .addGroupBy('pe."ttmEps"')
    .addGroupBy('pe."pe"')
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
      'MIN(yr.pe) as "peYrLo"',
      'MAX(yr.pe) as "peYrHi"',
      ])
    , 'pe')
  .leftJoin(q => q.from(StockDailyAdvancedStat, 'a')
    .innerJoin(StockDailyAdvancedStat, 'back', 'back.symbol = a.symbol')
    .where('back."date" between a."date" - 365 AND a."date"')
    .groupBy('a.symbol')
    .addGroupBy('a."date"')
    .addGroupBy('a."beta"')
    .addGroupBy('a."peRatio"')
    .addGroupBy('a."forwardPeRatio"')
    .select([
      'a.symbol as symbol',
      'a."date" as "date"',
      'a."beta" as "beta"',
      'a."peRatio" as "peRatio"',
      'a."forwardPeRatio" as "forwardPeRatio"',
      'min(back."peRatio") as "peYrLo"',
      'max(back."peRatio") as "peYrHi"'
      ]), 'x'
    , 'x.symbol = pe.symbol AND x."date" = pe."date"')
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
    'pe."peYrLo" as "peYrLo"',
    'pe."peYrHi" as "peYrHi"',
    'x.beta as beta',
    'x."peRatio" as "peRatio"',
    'x."forwardPeRatio" as "forwardPeRatio"',
    'pe."close" / x."forwardPeRatio" as "forwardEps"',
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
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  peYrLo: number;

  @ViewColumn()
  peYrHi: number;

  @ViewColumn()
  beta: number;

  @ViewColumn()
  peRatio: number;

  @ViewColumn()
  forwardPeRatio: number;

  @ViewColumn()
  forwardEps: number;
}
