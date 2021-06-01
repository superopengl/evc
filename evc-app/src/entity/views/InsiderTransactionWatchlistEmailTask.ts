import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockWatchList } from '../StockWatchList';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { StockInsiderTransaction } from '../StockInsiderTransaction';
import { StockInsiderTransactionPreviousSnapshot } from '../StockInsiderTransactionPreviousSnapshot';



@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockWatchList, 'swt')
    .innerJoin(User, 'u', 'u.id = swt."userId" AND u."deletedAt" IS NUll')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .innerJoin(StockInsiderTransaction, 'lts', 'lts.symbol = swt.symbol')
    .leftJoin(StockInsiderTransactionPreviousSnapshot, 'pre', 'lts.symbol = pre.symbol')
    .where(`swt.belled IS TRUE`)
    .andWhere(`(pre.value IS NULL OR md5(lts.value::text) != md5(pre.value::text))`)
    .select([
      'u.id as "userId"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'swt.symbol as symbol',
    ])
})
export class InsiderTransactionWatchlistEmailTask {
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
