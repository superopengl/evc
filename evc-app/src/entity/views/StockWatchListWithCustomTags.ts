import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockWatchList } from '../StockWatchList';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockWatchList, 's')
    .leftJoin('stock_watch_list_tags_stock_user_custom_tag', 'tg', 'tg."stockWatchListId" = s.id')
    .groupBy('s."userId"')
    .addGroupBy('s.symbol')
    .addGroupBy('s.belled')
    .select([
      's."userId" as "userId"',
      's.symbol as symbol',
      's.belled as belled',
      'array_agg(tg."stockUserCustomTagId") as tags'
    ])
})
export class StockWatchListWithCustomTags {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  belled: boolean;

  @ViewColumn()
  tags: string[];
}

