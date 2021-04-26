import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';
import { StockDailyClose } from '../StockDailyClose';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q.from(q => q.from(StockEps, 'eps')
      .innerJoin(q => q.from(StockDailyClose, 'sc'), 'sc', 'sc.symbol = eps.symbol')
      .where('eps."reportDate" <= sc.date')
      .select([
        'sc.symbol',
        'sc.date',
        'sc.close',
        'eps.value as "epsValue"',
        'rank() over (partition by sc.symbol, sc.date order by eps."reportDate" desc)'
      ]),
    'x')
      .select([
        'symbol',
        'date',
        'close',
        'sum("epsValue") as "ttmEps"',
      ])
      .where('rank <= 4')
      .groupBy('symbol, date, close')
    , 'x')
    .select([
      'symbol',
      'date',
      'close',
      'CASE WHEN "ttmEps" > 0 THEN "ttmEps" ELSE NULL END as "ttmEps"',
      'CASE WHEN "ttmEps" > 0 THEN close / "ttmEps" ELSE NULL END as pe',
    ])
})
export class StockDailyPe {
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
}


