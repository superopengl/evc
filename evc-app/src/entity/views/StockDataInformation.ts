import { ViewEntity, Connection, PrimaryColumn, ViewColumn } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';
import { StockHistoricalComputedFairValue } from './StockHistoricalComputedFairValue';
import { Stock } from '../Stock';
import { StockEps } from '../StockEps';
import { StockDailyClose } from '../StockDailyClose';
import { StockDailyPutCallRatio } from '../StockDailyPutCallRatio';
import { StockDailyPe } from './StockDailyPe';
import { StockComputedPe90 } from './StockComputedPe90';


@ViewEntity({
  materialized: true,
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Stock, 's')
    .leftJoin(q => q
      .from(StockEps, 'e')
      .groupBy('symbol')
      .select([
        'symbol',
        'min("reportDate") as "epsFrom"',
        'max("reportDate") as "epsTo"',
        'count(*) as "epsCount"',
      ])
      , 'eps', 's.symbol = eps.symbol')
    .leftJoin(q => q
      .from(StockDailyClose, 'c')
      .groupBy('symbol')
      .select([
        'symbol',
        'min(date) as "closeFrom"',
        'max(date) as "closeTo"',
        'count(*) as "closeCount"',
      ])
      , 'close', 's.symbol = close.symbol')
    .leftJoin(q => q
      .from(StockComputedPe90, 'e')
      .groupBy('symbol')
      .select([
        'symbol',
        'min(date) as "pe90From"',
        'max(date) as "pe90To"',
        'count(*) as "pe90Count"',
      ])
      , 'pe', 's.symbol = pe.symbol')
    .select([
      `s.symbol as symbol`,
      `"epsFrom"`,
      `"epsTo"`,
      `"epsCount"`,
      `"closeFrom"`,
      `"closeTo"`,
      `"closeCount"`,
      `"pe90From"`,
      `"pe90To"`,
      `"pe90Count"`,
    ])
})
export class StockDataInformation {
  @ViewColumn()
  @PrimaryColumn()
  symbol: string;

  @ViewColumn()
  closeFrom: string;

  @ViewColumn()
  closeTo: string;

  @ViewColumn()
  closeCount: number;

  @ViewColumn()
  epsFrom: string;

  @ViewColumn()
  epsTo: string;

  @ViewColumn()
  epsCount: number;

  @ViewColumn()
  pe90From: string;

  @ViewColumn()
  pe90To: string;

  @ViewColumn()
  pe90Count: number;
}
