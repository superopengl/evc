import { ViewEntity, Connection, PrimaryColumn, ViewColumn } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';
import { StockHistoricalComputedFairValue } from './StockHistoricalComputedFairValue';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockLatestPaidInformation, 'h')
    .leftJoin(q => q
      .from(q => q
        .from(q => q
          .from(StockHistoricalComputedFairValue, 'x')
          .select([
            `symbol`,
            `"reportDate"`,
            `"fairValueLo"`,
            `"fairValueHi"`,
            `rank() over (partition by symbol order by x."reportDate" desc)`
          ]), 'x')
        .where(`2 <= rank AND rank <=5`)
        .andWhere(`"fairValueLo" IS NOT NULL AND "fairValueHi" IS NOT NULL`)
        .groupBy('symbol')
        .select('symbol')
        .addSelect(`array_agg(json_build_object('date', "reportDate", 'lo', "fairValueLo", 'hi', "fairValueHi")) as "fairValues"`)
        , 'f')
      , 'f', 'h.symbol = f.symbol')
    .select([
      `h.symbol as symbol`,
      `h.company as company`,
      `h.tags as tags`,
      `f."fairValues" as "fairValues"`,
      `h."lastPrice" as "lastPrice"`,
    ])
})
export class StockLatestFreeInformation {
  @ViewColumn()
  @PrimaryColumn()
  symbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  tags: string[];

  @ViewColumn()
  fairValues: { lo: number, hi: number }[];

  @ViewColumn()
  lastPrice: number;
}
