import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockWatchList } from '../StockWatchList';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { StockInsiderTransaction } from '../StockInsiderTransaction';
import { StockInsiderTransactionPreviousSnapshot } from '../StockInsiderTransactionPreviousSnapshot';
import { Role } from '../../types/Role';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockWatchList, 'swt')
    .innerJoin(User, 'u', 'u.id = swt."userId"')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .innerJoin(StockInsiderTransaction, 'lts', 'lts.symbol = swt.symbol')
    .leftJoin(StockInsiderTransactionPreviousSnapshot, 'pre', 'lts.symbol = pre.symbol')
    .where(`u."deletedAt" IS NUll`)
    .andWhere(`u.role = '${Role.Member}'`)
    .andWhere(`swt.belled IS TRUE`)
    .andWhere(`lts."firstHash" != pre."firstHash"`)
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
