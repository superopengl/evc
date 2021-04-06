import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockWatchList } from '../StockWatchList';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { CoreDataLatestSnapshot } from './CoreDataLatestSnapshot';
import { CoreDataPreviousSnapshot } from '../CoreDataPreviousSnapshot';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockWatchList, 'swt')
    .where(`belled IS TRUE`)
    .innerJoin(User, 'u', 'u.id = swt."userId" AND u."deletedAt" IS NUll')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .innerJoin(CoreDataLatestSnapshot, 'lts', 'lts.symbol = swt.symbol')
    .leftJoin(CoreDataPreviousSnapshot, 'pre', 'lts.symbol = pre.symbol')
    .where(`(pre.hash IS NULL OR lts.hash != pre.hash)`)
    .select([
      'u.id as "userId"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'swt.symbol as symbol',
      'lts."fairValueLo" as "fairValueLo"',
      'lts."fairValueHi" as "fairValueHi"',
      'lts.supports as supports',
      'lts.resistances as resistances',
      'lts.hash as hash',
      'lts.date as date',
    ])
})
export class CoreDataWatchlistEmailTask {
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

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  supports: { lo: number, hi: number }[];

  @ViewColumn()
  resistances: { lo: number, hi: number }[];

  @ViewColumn()
  hash: string;

  @ViewColumn()
  date: string;
}


