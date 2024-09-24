import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { OptionPutCallHistory } from '../OptionPutCallHistory';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(OptionPutCallHistory, 'i')
    .select([
      'i.symbol as symbol',
      'i.date as date',
      'i.name as name',
      'i.type as type',
      'i."putCallVol" as "putCallVol"',
      'i."todayTotalVol" as "todayTotalVol"',
      'i."putCallOIRatio" as "putCallOIRatio"',
      'i."totalOpenInterest" as "totalOpenInterest"',
      '1 - 100 / ("putCallVol" + 1) as "todayPercentPutVol"',
      '100 / ("putCallVol" + 1) as "todayPercentCallVol"',

    ])
})
export class OptionPutCallHistoryInformation {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  type: 'index' | 'etfs' | 'nasdaq';

  /**
   * P/C Vol
   */
  @ViewColumn()
  putCallVol: number;

  /**
   * Options Vol; Today Option Volume
   */
  @ViewColumn()
  todayTotalVol: number;

  /**
   * P/C OI; Total P/C OI Ratio
   */
  @ViewColumn()
  putCallOIRatio: number;

  /**
   * Total OI; Total Open Interest
   */
  @ViewColumn()
  totalOpenInterest: number;

  @ViewColumn()
  todayPercentPutVol: number;

  @ViewColumn()
  todayPercentCallVol: number;
}
