import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockEps } from '../StockEps';
import { StockClose } from '../StockClose';


@ViewEntity({
  materialized: true,
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
      'symbol',
      'date',
      'close',
      'sum("epsValue") as "ttmEps"',
    ])
    .where('rank <= 4')
    .groupBy(`symbol, date, close`)
})
export class StockDailyPeRaw {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  pe: number;
}
@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockDailyPeRaw, 'x')
    .where(`"ttmEps" > 0`)
    .select([
      'symbol',
      'date',
      'close',
      `"ttmEps"`,
      `close / "ttmEps" as pe`,
    ])
})
export class StockDailyPe{
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  pe: number;
}

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockDailyPeRaw, 'x')
    .where(`"ttmEps" <= 0`)
    .select([
      'symbol',
      'date',
      'close',
      `"ttmEps"`,
      `'N/A' as pe`,
    ])
})
export class StockDailyPeNa{
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  pe: number;
}

