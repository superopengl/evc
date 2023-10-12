import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentMethod } from '../../types/PaymentMethod';
import { PaymentStatus } from '../../types/PaymentStatus';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { UserCreditTransaction } from '../UserCreditTransaction';
import { User } from '../User';
import { UserProfile } from '../UserProfile';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .where(`s.status = '${SubscriptionStatus.Alive}'`)
    .innerJoin(User, 'u', 's."userId" = u.id')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      's.id as "subscriptionId"',
      's.type as "subscriptionType"',
      'u.id as "userId"',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'p.email as email',
      's.start as start',
      's.end as end',
      's.type as type',
      's.recurring as recurring',
      's."alertDays" as "alertDays"',
    ])
})
export class AliveSubscriptionInformation {
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  subscriptionType: SubscriptionType;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  alertDays: number;
}
