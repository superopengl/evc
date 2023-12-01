import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockResistance } from '../StockResistance';
import { StockDailyClose } from '../StockDailyClose';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockResistance, 'sr')
    .innerJoin(Stock, 's', 'sr.symbol = s.symbol')
    .innerJoin(q => q
      .from(StockDailyClose, 'c')
      .distinctOn(['symbol'])
      .orderBy('symbol')
      .addOrderBy('date', 'DESC'),
      'c', 'c.symbol = sr.symbol AND c.close > sr.hi')
    .select([
      `sr.id as "resistanceId"`,
      `sr.symbol as symbol`,
      `sr.lo as "resistanceLo"`,
      `sr.hi as "resistanceHi"`,
      `c.close as close`,
      `c.date as date`,
    ])
})
export class StockDeprecateResistance {
  @ViewColumn()
  resistanceId: string;

  @ViewColumn()
  symbol: string;

  @ViewColumn()
  resistanceLo: number;

  @ViewColumn()
  resistanceHi: number;

  @ViewColumn()
  close: number;

  @ViewColumn()
  date: string;
}
