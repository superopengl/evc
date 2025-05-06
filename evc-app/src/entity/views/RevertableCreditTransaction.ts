import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { UserCreditTransaction } from '../UserCreditTransaction';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
  .from(UserCreditTransaction, 't')
  .innerJoin(Payment, 'p', 'p."creditTransactionId" = t.id')
  .innerJoin(Subscription, 's', `p."subscriptionId" = s.id AND s.status = '${SubscriptionStatus.Provisioning}'`)
  .where(`s."createdAt" <= now() - INTERVAL '1 day'`)
  .select([
    't.id as "creditTransactionId"',
    't."userId" as "userId"',
    't.amount as amount',
    's.id as "subscriptionId"'
    ])
  })
export class RevertableCreditTransaction {
  @ViewColumn()
  @PrimaryColumn()
  creditTransactionId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  amount: number;

  @ViewColumn()
  subscriptionId: string;
}
