import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockSupport } from '../StockSupport';
import { StockLatestFairValue } from './StockLatestFairValue';
import { Stock } from '../Stock';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockSupport, 'sp')
    .innerJoin(Stock, 's', 'sp.symbol = s.symbol')
    .innerJoin(StockLatestFairValue, 'fv', 'fv.symbol = sp.symbol AND fv."fairValueHi" < sp.lo')
    .select([
      `sp.id as "supportId"`,
      `sp.symbol as symbol`,
      `s.company as company`,
      `sp.lo as "supportLo"`,
      `sp.hi as "supportHi"`,
      `fv."fairValueLo" as "fairValueLo"`,
      `fv."fairValueHi" as "fairValueHi"`,
    ])
})
export class StockDeprecateSupport {
  @ViewColumn()
  supportId: string;

  @ViewColumn()
  symbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  supportLo: number;

  @ViewColumn()
  supportHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;
}
