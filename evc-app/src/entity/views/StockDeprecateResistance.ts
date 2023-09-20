import { ViewEntity, Connection, PrimaryColumn, ViewColumn } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';
import { StockHistoricalComputedFairValue } from './StockHistoricalComputedFairValue';
import { StockSupport } from '../StockSupport';
import { StockLastFairValue } from './StockLastFairValue';
import { StockWatchList } from '../StockWatchList';
import { Stock } from '../Stock';
import { StockResistance } from '../StockResistance';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockResistance, 'sr')
    .innerJoin(Stock, 's', 'sr.symbol = s.symbol')
    .innerJoin(StockLastFairValue, 'fv', 'fv.symbol = sr.symbol AND fv."fairValueLo" > sr.hi')
    .leftJoin(StockWatchList, 'wh', 'sr.symbol = wh.symbol AND wh.belled IS TRUE')
    .select([
      `sr.id as "resistanceId"`,
      `sr.symbol as symbol`,
      `s.company as company`,
      `sr.lo as "resistanceLo"`,
      `sr.hi as "resistanceHi"`,
      `fv."fairValueLo" as "fairValueLo"`,
      `fv."fairValueHi" as "fairValueHi"`,
      `wh."userId" as "userId"`,
    ])
})
export class StockDeprecateSupport {
  @ViewColumn()
  resistanceId: string;

  @ViewColumn()
  symbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  resistanceLo: number;

  @ViewColumn()
  resistanceHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  bellingUserId: string;
}
