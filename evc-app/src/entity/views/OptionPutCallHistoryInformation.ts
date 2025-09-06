import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { OptionPutCallHistory } from '../OptionPutCallHistory';
import { OptionPutCallAllDefInformation } from './OptionPutCallAllDefInformation';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
  .from(OptionPutCallAllDefInformation, 's')
  .leftJoin(q => q.from(OptionPutCallHistory, 'i').where(`CURRENT_DATE - "date" < 180`), 'i', 's.symbol = i.symbol')
  .select([
    's.symbol as symbol',
    's.company as name',
    's."type" as "type"',
    's."sortGroup" as "sortGroup"',
    's."tagId" as "tagId"',
    's."ordinal" as "ordinal"',
    'i."date" as "date"',
    'i."putCallVol" as "putCallVol"',
    'i."todayOptionVol" + i."todayOptionVolDelta" as "todayOptionVol"',
    'i."putCallOIRatio" + i."putCallOIRatioDelta" as "putCallOIRatio"',
    'i."totalOpenInterest" + i."totalOpenInterestDelta" as "totalOpenInterest"',
    '100 - 100 / (i."putCallVol" + 1) as "todayPercentPutVol"',
    '100 / (i."putCallVol" + 1) as "todayPercentCallVol"',
    ])
  .orderBy('s.ordinal', 'ASC', 'NULLS LAST')
  })
export class OptionPutCallHistoryInformation {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  type: string;

  @ViewColumn()
  sortGroup: number;

  @ViewColumn()
  tagId: string;

  @ViewColumn()
  ordinal: number;
  /**
   * P/C Vol
   */
  @ViewColumn()
  putCallVol: number;

  /**
   * Options Vol; Today Option Volume
   */
  @ViewColumn()
  todayOptionVol: number;

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
