import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { OptionPutCall } from '../OptionPutCall';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(OptionPutCall, 'i')
    .select([
      'i.symbol as symbol',
      'i.date as date',
      'i.name as name',
      'i.type as type',
      'i."putCallVolumeRatio" as "putCallVolumeRatio"',
      'i."totalVolume" as "totalVolume"',
      'i."putCallOpenInterestRatio" as "putCallOpenInterestRatio"',
      'i."totalOpenInterest" as "totalOpenInterest"',
      '1 - 100 / ("putCallVolumeRatio" + 1) as "todayPercentPutVolume"',
      '100 / ("putCallVolumeRatio" + 1) as "todayPercentCallVolume"',

    ])
})
export class OptionPutCallInformation {
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
  putCallVolumeRatio: number;

  /**
   * Options Vol; Today Option Volume
   */
  @ViewColumn()
  totalVolume: number;

  /**
   * P/C OI; Total P/C OI Ratio
   */
  @ViewColumn()
  putCallOpenInterestRatio: number;

  /**
   * Total OI; Total Open Interest
   */
  @ViewColumn()
  totalOpenInterest: number;

  @ViewColumn()
  todayPercentPutVolume: number;

  @ViewColumn()
  todayPercentCallVolume: number;
}
