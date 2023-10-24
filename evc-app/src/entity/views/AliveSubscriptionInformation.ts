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
import { UserCurrentSubscriptionInformation } from './UserCurrentSubscriptionInformation';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(UserCurrentSubscriptionInformation, 's')
    .where(`s.status = '${SubscriptionStatus.Alive}'`)
    .innerJoin(User, 'u', 's."userId" = u.id')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      's.id as "subscriptionId"',
      'u.id as "userId"',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'p.email as email',
      's.start as start',
      's.end as end',
      's.recurring as recurring',
    ])
})
export class AliveSubscriptionInformation {
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  type: SubscriptionType;

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
}
