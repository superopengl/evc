import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(q => q
      .from(StockEps, 'x')
      .select([
        `symbol`,
        `"reportDate"`,
        `value`,
        `rank() over (partition by symbol order by "reportDate") as rank`
      ])
      , 'latter')
    .innerJoin(q => q
      .from(StockEps, 'x')
      .select([
        `symbol`,
        `"reportDate"`,
        `value`,
        `rank() over (partition by symbol order by "reportDate") as rank`
      ])
      , 'former', `latter.symbol = former.symbol AND latter.rank = former.rank + 1 AND latter.value = former.value`)
    .where(`latter."reportDate" - former."reportDate" < 80`)
    .select([
      `latter.symbol as symbol`,
      `former."reportDate" as "reportDateFormer"`,
      `latter."reportDate" as "reportDateLatter"`,
      `latter."value" as "value"`,
      `latter."reportDate" - former."reportDate" as "span"`,
      `CASE WHEN former."reportDate" > CURRENT_DATE - INTERVAL '3 months' AND latter."reportDate" - former."reportDate" <= 30 THEN TRUE ELSE FALSE END AS recent`,
    ])
})
export class StockUnusualEpsAlert {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  reportDateFormer: string;

  @ViewColumn()
  reportDateLatter: string;

  @ViewColumn()
  value: number;

  @ViewColumn()
  span: number;

  @ViewColumn()
  recent: boolean;
}
