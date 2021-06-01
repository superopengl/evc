import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { User } from '../User';
import { UserProfile } from '../UserProfile';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .groupBy('"userId"')
      .select([
        '"userId"',
        'MIN(start) as start',
        'MAX("end") as "end"'
      ])
      , 'x')
    .leftJoin(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .distinctOn(['"userId"'])
      .orderBy('"userId"')
      .addOrderBy('start', 'ASC')
      .select([
        '"userId"',
        '"end"',
        'type',
        'id'
      ])
      , 'f', 'f."userId" = x."userId"')
    .leftJoin(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .distinctOn(['"userId"'])
      .orderBy('"userId"')
      .addOrderBy('"end"', 'DESC')
      .select([
        '"userId"',
        'recurring',
        '"end"',
        'type',
        'id'
      ])
      , 'r', 'r."userId" = x."userId"')
    .innerJoin(User, 'u', 'x."userId" = u.id')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      'x."userId" as "userId"',
      'p.email as email',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'x.start as start',
      'x."end" as "end"',
      'f.id as "currentSubscriptionId"',
      'f.type as "currentType"',
      'f."end" as "currentEnd"',
      'r.id as "lastSubscriptionId"',
      'r.type as "lastType"',
      'r."end" as "lastEnd"',
      'r.recurring as "lastRecurring"',
    ])
})
export class UserAliveSubscriptionSummary {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  email: string;
  
  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  start: string;

  @ViewColumn()
  end: string;

  @ViewColumn()
  currentSubscriptionId: string;

  @ViewColumn()
  currentType: SubscriptionType;

  @ViewColumn()
  currentEnd: string;

  @ViewColumn()
  lastSubscriptionId: string;

  @ViewColumn()
  lastType: SubscriptionType;

  @ViewColumn()
  lastEnd: string;

  @ViewColumn()
  lastRecurring: boolean;
}
