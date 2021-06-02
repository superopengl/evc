import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockWatchList } from '../StockWatchList';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { FairValueLatestSnapshot } from './FairValueLatestSnapshot';
import { FairValuePreviousSnapshot } from '../FairValuePreviousSnapshot';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockWatchList, 'swt')
    .innerJoin(User, 'u', 'u.id = swt."userId" AND u."deletedAt" IS NUll')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .innerJoin(FairValueLatestSnapshot, 'lts', 'lts.symbol = swt.symbol')
    .leftJoin(FairValuePreviousSnapshot, 'pre', 'lts.symbol = pre.symbol')
    .where(`swt.belled IS TRUE`)
    .andWhere(`(pre.hash IS NULL OR lts.hash != pre.hash)`)
    .select([
      'u.id as "userId"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'swt.symbol as symbol',
    ])
})
export class FairValueWatchlistEmailTask {
  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  symbol: string;
}
