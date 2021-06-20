import { ViewEntity, Connection } from 'typeorm';
import { StockWatchList } from '../StockWatchList';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(q => q
      .from(StockWatchList, 'w')
      .groupBy('symbol')
      .select([
        'symbol',
        'count(1) as count'
      ]),
      'w')
    .innerJoin(StockLatestPaidInformation, 'i', 'w.symbol = i.symbol')
    .select([
      'w.count',
      'i.symbol',
      'i."lastPrice"',
      'i."lastChange"',
      'i."lastChangePercent"',
      'i."fairValueLo"',
      'i."fairValueHi"',
      'i."isUnder"',
      'i."isOver"',
      'i."supports"',
      'i."resistances"',
    ])
    .orderBy('w.count', 'DESC')
    .addOrderBy('i.symbol')
})
export class StockWatchListStatInformation {
}
