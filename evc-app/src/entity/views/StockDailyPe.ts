import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';
import { StockClose } from '../StockClose';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q.from(q => q.from(StockEps, 'eps')
      .innerJoin(q => q.from(StockClose, 'sc'), 'sc', `sc.symbol = eps.symbol`)
      .where(`eps."reportDate" <= sc.date`)
      .select([
        `sc.symbol`,
        `sc.date`,
        `sc.close`,
        `sc."extendedClose"`,
        `eps.value as "epsValue"`,
        `rank() over (partition by sc.symbol, sc.date order by eps."reportDate" desc)`
      ]),
      'x')
      .select([
        'symbol',
        'date',
        'close',
        '"extendedClose"',
        'sum("epsValue") as "ttmEps"',
      ])
      .where('rank <= 4')
      .groupBy(`symbol, date, close, "extendedClose"`)
      , 'x')
    .select([
      'symbol',
      'date',
      'close',
      '"extendedClose"',
      `"ttmEps"`,
      `CASE WHEN "ttmEps" > 0 THEN COALESCE("extendedClose", close) / "ttmEps" ELSE NULL END as pe`,
    ])
})
export class StockDailyPe {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  pe: number;
}


