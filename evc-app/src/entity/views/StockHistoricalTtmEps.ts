import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';

@ViewEntity({
  materialized: false,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q
      .from(StockEps, 'r')
      .leftJoin(StockEps, 'x', 'x.symbol = r.symbol AND x."reportDate" <= r."reportDate"')
      .select([
        `r.symbol as symbol`,
        `r."reportDate" as "reportDate"`,
        `x.value as "epsValue"`,
        `rank() over (partition by r.symbol, r."reportDate" order by x."reportDate" desc)`
      ])
      , 'k')
    .where(`rank <= 4`)
    .groupBy(`symbol, "reportDate"`)
    .having(`count(*) >= 4`)
    .select([
      `symbol`,
      `"reportDate"`,
      `sum("epsValue") as "ttmEps"`
    ])
})
export class StockHistoricalTtmEps {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDate: string;

  @ViewColumn()
  ttmEps: number;
}
