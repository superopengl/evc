import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { User } from '../User';
import { UserProfile } from '../UserProfile';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .groupBy('"userId"')
      .select([
        '"userId"',
        'MIN(start) as start',
        'MAX("end") as "end"'
      ])
      , 'x')
    .innerJoin(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .distinctOn(['"userId"'])
      .orderBy('"userId"')
      .addOrderBy('start', 'ASC')
      .select([
        '"userId"',
        'type',
        'id'
      ])
      , 'f', 'f."userId" = x."userId"')
    .innerJoin(q => q
      .from(Subscription, 's')
      .where(`status = '${SubscriptionStatus.Alive}'`)
      .andWhere('CURRENT_DATE <= "end"')
      .distinctOn(['"userId"'])
      .orderBy('"userId"')
      .addOrderBy('"end"', 'DESC')
      .select([
        '"userId"',
        'recurring',
        'id'
      ])
      , 'r', 'r."userId" = x."userId"')
    .innerJoin(User, 'u', 'x."userId" = u.id')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      'x."userId" as "userId"',
      'x.start as start',
      'x."end" as "end"',
      'f.type as "currentType"',
      'r.recurring as "lastRecurring"',
      'f.id as "currentSubscriptionId"',
      'r.id as "lastSubscriptionId"',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'p.email as email',
    ])
})
export class UserCurrentSubscription {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  currentType: SubscriptionType;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  lastRecurring: boolean;

  @ViewColumn()
  currentSubscriptionId: string;

  @ViewColumn()
  lastSubscriptionId: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  email: string;
}
