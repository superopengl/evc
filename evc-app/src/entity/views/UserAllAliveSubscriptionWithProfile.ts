import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionType } from '../../types/SubscriptionType';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Subscription } from '../Subscription';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .where(`s.status = '${SubscriptionStatus.Alive}'`)
    .innerJoin(User, 'u', 's."userId" = u.id')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      's.id as "subscriptionId"',
      's."userId" as "userId"',
      's.start as start',
      's."end" as "end"',
      's.type as type',
      's.recurring as recurring',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'p.email as email',
    ])
})
export class UserAllAliveSubscriptionWithProfile {
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  type: SubscriptionType;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  email: string;
}
