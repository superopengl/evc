import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionType } from '../../types/SubscriptionType';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { UserCurrentSubscription } from './UserCurrentSubscription';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(UserCurrentSubscription, 's')
    .innerJoin(User, 'u', 's."userId" = u.id')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .select([
      's."userId" as "userId"',
      's.start as start',
      's."end" as "end"',
      's."currentType" as "currentType"',
      's."lastRecurring" as "lastRecurring"',
      's."currentSubscriptionId" as "currentSubscriptionId"',
      's."lastSubscriptionId" as "lastSubscriptionId"',
      'p."givenName" as "givenName"',
      'p.surname as surname',
      'p.email as email',
    ])
})
export class UserCurrentSubscriptionWithProfile {
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
