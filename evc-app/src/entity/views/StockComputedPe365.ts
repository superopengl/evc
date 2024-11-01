import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockComputedPe90 } from './StockComputedPe90';
import { StockDailyAdvancedStat } from '../StockDailyAdvancedStat';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockComputedPe90, 'pe')
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
      'x.beta as beta',
      'x."peRatio" as "peRatio"',
      'x."forwardPeRatio" as "forwardPeRatio"',
      'x."peYrLo" as "peYrLo"',
      'x."peYrHi" as "peYrHi"',
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
  beta: number;

  @ViewColumn()
  peRatio: number;

  @ViewColumn()
  forwardPeRatio: number;

  @ViewColumn()
  peYrLo: number;

  @ViewColumn()
  peYrHi: number;

  @ViewColumn()
  forwardEps: number;
}
