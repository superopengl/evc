import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockLatestFairValue } from './StockLatestFairValue';
import { Stock } from '../Stock';
import { StockResistance } from '../StockResistance';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockResistance, 'sr')
    .innerJoin(Stock, 's', 'sr.symbol = s.symbol')
    .innerJoin(StockLatestFairValue, 'fv', 'fv.symbol = sr.symbol AND fv."fairValueLo" > sr.hi')
    .select([
      `sr.id as "resistanceId"`,
      `sr.symbol as symbol`,
      `s.company as company`,
      `sr.lo as "resistanceLo"`,
      `sr.hi as "resistanceHi"`,
      `fv."fairValueLo" as "fairValueLo"`,
      `fv."fairValueHi" as "fairValueHi"`,
    ])
})
export class StockDeprecateResistance {
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
}
