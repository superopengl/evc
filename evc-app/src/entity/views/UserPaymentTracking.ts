import { ViewEntity, Connection } from 'typeorm';
import { Role } from '../../types/Role';
import { Subscription } from '../Subscription';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Payment } from '../Payment';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(User, 'u')
    .where(`u."deletedAt" IS NULL`)
    .andWhere(`u.role != '${Role.Admin}'`)
    .innerJoin(UserProfile, 'f', 'u."profileId" = f.id')
    .leftJoin(Subscription, 's', 's."userId" = u.id')
    .leftJoin(Payment, 'p', 'p."subscriptionId" = s.id')
    .select([
      'f.email as email',
      'u.role as "role"',
      'u.status as "userStatus"',
      's.type as "subscriptionType"',
      's."createdAt" as "subscriptionCreatedAt"',
      's.recurring as "recurring"',
      's.status as "subscriptionStatus"',
      'p.method as method',
      'p."stripeCustomerId" as "stripeCustomerId"',
      'p."createdAt" as "createdAt"',
      'p."lastUpdatedAt" as "lastUpdatedAt"',
      'p.status as "paymentStatus"',
      'p.amount as "amount"',
      'p.start as "start"',
      'p.end as "end"',
      'p."creditTransactionId" as "creditTransactionId"',
      'u.id as "userId"',
      'f.id as "profileId"',
      's.id as "subscriptionId"',
      'p.id as "paymentId"',
    ])
    .orderBy('f.email')
    .addOrderBy('s."createdAt"')
    .addOrderBy('p."createdAt"')
})
export class UserPaymentTracking {
}
