import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockDailyPe } from './StockDailyPe';

/**
 *
select symbol, date, avg - stddev as "peLo", avg + stddev as "peHi" from
(
select pe.symbol, pe.date, avg(back.pe), stddev(back.pe) from stock_daily_pe pe
inner join stock_daily_pe back on pe.symbol = back.symbol
where back.date between pe."date" - 90 and pe."date"
and exists(select * from stock_daily_pe sdp where sdp.date = pe."date" - 90)
group by pe.symbol, pe.date
) x;
 */

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q.from(StockDailyPe, 'pe')
    .innerJoin(StockDailyPe, 'back', `pe.symbol = back.symbol`)
    .where(`back.date between pe."date" - 90 and pe."date"`)
    .andWhere(`exists(select 1 from evc.stock_daily_pe sdp where sdp.date = pe."date" - 90)`)
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
      'x.avg - x.stddev as "peLo"',
      'x.avg + x.stddev as "peHi"',
      'x."ttmEps" * (x.avg - x.stddev) as "fairValueLo"',
      'x."ttmEps" * (x.avg + x.stddev) as "fairValueHi"',
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
}
