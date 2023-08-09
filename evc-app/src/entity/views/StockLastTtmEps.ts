import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q
      .from(StockEps, 'eps')
      .select([
        'symbol',
        `"reportDate"`
      ])
      .distinctOn(['symbol', '"reportDate"'])
      .orderBy('"reportDate"', 'DESC'),
      'r'
    )
    .leftJoin(q => q
      .from(q => q
        .from(StockEps, 'sc')
        .select([
          `sc.symbol as symbol`,
          `sc.value as "epsValue"`,
          `rank() over (partition by sc.symbol order by sc."reportDate" desc)`
        ]),
        'x')
      .select([
        'x.symbol as symbol',
        'sum(x."epsValue") as "ttmEps"',
      ])
      .where('rank <= 4')
      .groupBy(`symbol`),
      'sum', 'r.symbol = sum.symbol')
    .select([
      `r.symbol as symbol`,
      `r."reportDate" as "reportDate"`,
      `sum."ttmEps" as "ttmEps"`,
    ])
})
export class StockLastTtmEps {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDate: string;

  @ViewColumn()
  ttmEps: number;
}
