import { ViewEntity, Connection } from 'typeorm';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { StockWatchList } from '../StockWatchList';
import { StockUserCustomTag } from '../StockUserCustomTag';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
  .from(StockWatchList, 's')
  .innerJoin(User, 'u', 'u.id = s."userId"')
  .innerJoin(UserProfile, 'f', 'u."profileId" = f.id')
  .leftJoin('stock_watch_list_tags_stock_user_custom_tag', 'tg', 'tg."stockWatchListId" = s.id')
  .innerJoin(StockUserCustomTag, 't', 't.id = tg."stockUserCustomTagId"')
  .where(`u."deletedAt" IS NULL`)
  .select([
    'f.email as email',
    's.symbol as symbol',
    'u.role as "role"',
    't.name as "tagName"',
    't.id as "tagId"',
    'u.id as "userId"',
    ])
  .orderBy('f.email')
  .addOrderBy('s.symbol')
  .addOrderBy('t.name')
  })
export class UserCustomTagWatchListStockInformation {
}
