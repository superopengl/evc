import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';
import { StockClose } from '../StockClose';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
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
      `x.close / sum("epsValue") as pe`
    ])
    .where('x.rank <= 4')
    .groupBy(`x.symbol, x.date, x.close`)
})
export class StockDailyPe {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  pe: number;
}

