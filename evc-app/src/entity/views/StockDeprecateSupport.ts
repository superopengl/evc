import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockSupport } from '../StockSupport';
import { Stock } from '../Stock';
import { StockDailyClose } from '../StockDailyClose';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockSupport, 'sp')
    .innerJoin(Stock, 's', 'sp.symbol = s.symbol')
    .innerJoin(q => q
      .from(StockDailyClose, 'c')
      .distinctOn(['symbol'])
      .orderBy('symbol', 'DESC')
      .addOrderBy('date', 'DESC'),
      'c', 'c.symbol = sp.symbol AND c.close < sp.lo')
    .select([
      `sp.id as "supportId"`,
      `sp.symbol as symbol`,
      `sp.lo as "supportLo"`,
      `sp.hi as "supportHi"`,
      `c.close as close`,
      `c.date as date`,
    ])
})
export class StockDeprecateSupport {
  @ViewColumn()
  supportId: string;

  @ViewColumn()
  symbol: string;

  @ViewColumn()
  supportLo: number;

  @ViewColumn()
  supportHi: number;

  @ViewColumn()
  close: number;

  @ViewColumn()
  date: string;
}
