import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { existsQuery } from '../../utils/existsQuery';
import { StockDailyPe } from './StockDailyPe';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q.from(StockDailyPe, 'pe')
      .innerJoin(StockDailyPe, 'back', 'pe.symbol = back.symbol')
      .where('back.date between pe."date" - 90 and pe."date"')
      // .andWhere(`exists(select 1 from evc.stock_all_computed_pe sdp where sdp.date = pe."date" - 90)`)
      .andWhere(
        existsQuery(
          connection
            .getRepository(StockDailyPe)
            .createQueryBuilder('sdp')
            .where('sdp.date <= pe."date" - 90')
            // .select('1')
        )
      )
      .groupBy('pe.symbol')
      .addGroupBy('pe.date')
      .addGroupBy('pe."ttmEps"')
      .addGroupBy('pe.pe')
      .select([
        'pe.symbol as symbol',
        'pe.date as date',
        'pe."ttmEps" as "ttmEps"',
        'pe.pe as pe',
        'avg(back.pe) as avg',
        'stddev(back.pe) as stddev'
      ])
      , 'x')
    .select([
      'x.symbol',
      'x.date',
      'x."ttmEps"',
      'x.pe',
      'x.avg as "pe90Avg"',
      'x.stddev as "pe90StdDev"',
      'x.avg - x.stddev as "peLo"',
      'x.avg + x.stddev as "peHi"',
      'x."ttmEps" * (x.avg - x.stddev) as "fairValueLo"',
      'x."ttmEps" * (x.avg + x.stddev) as "fairValueHi"',
    ])
})
export class StockComputedPe90 {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  ttmEps: number;

  @ViewColumn()
  pe: number;

  @ViewColumn()
  pe90Avg: number;

  @ViewColumn()
  pe90StdDev: number;

  @ViewColumn()
  peLo: number;

  @ViewColumn()
  peHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;
}


