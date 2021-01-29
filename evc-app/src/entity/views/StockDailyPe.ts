import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';
import { StockClose } from '../StockClose';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q
      .from(q => q.from(StockEps, 'eps')
        .innerJoin(q => q.from(StockClose, 'sc'), 'sc', `sc.symbol = eps.symbol`)
        .where(`eps."reportDate" <= sc.date`)
        .select([
          `sc.symbol`,
          `sc.date`,
          `sc.close`,
          `eps.value as "epsValue"`,
          `rank() over (partition by sc.symbol, sc.date order by eps."reportDate" desc)`
        ]),
        'x')
      .select([
        'x.symbol',
        'x.date',
        'x.close',
        'sum("epsValue") as "ttmEps"',
      ])
      .where('x.rank <= 4')
      .groupBy(`x.symbol, x.date, x.close`),
      'm')
    .where(`m."ttmEps" > 0`)
    .select([
      'm.symbol',
      'm.date',
      'm.close',
      `m."ttmEps"`,
      `m.close / m."ttmEps" as pe`,
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
