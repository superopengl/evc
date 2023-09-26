import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentMethod } from '../../types/PaymentMethod';
import { PaymentStatus } from '../../types/PaymentStatus';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { UserCreditTransaction } from '../UserCreditTransaction';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .innerJoin(q => q.from(Payment, 'p').where('p.status = \'paid\''), 'p', 'p."subscriptionId" = s.id')
    .leftJoin(q => q.from(UserCreditTransaction, 'b'), 'b', 'p."creditTransactionId" = b.id')
    .orderBy('s.start', 'DESC')
    .addOrderBy('p."lastUpdatedAt"', 'DESC')
    .select([
      's."userId" as "userId"',
      's.id as "subscriptionId"',
      'p.id as "paymentId"',
      'p."creditTransactionId" as "creditTransactionId"',
      's.start as start',
      's.end as end',
      's.type as type',
      's.status as "subscriptionStatus"',
      'p."lastUpdatedAt" as "paymentLastUpdatedAt"',
      'p."amount" as "paidAmount"',
      '-b."amount" as "usedCreditAmount"',
      'p."method" as "method"',
      'p."auto" as "autoPaid"',
    ])
})
export class SubscriptionPaymentCreditInformation {
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  @PrimaryColumn()
  paymentId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  type: SubscriptionType;

  @ViewColumn()
  subscriptionStatus: SubscriptionStatus;

  @ViewColumn()
  paymentLastUpdatedAt: Date;

  @ViewColumn()
  paidAmount: number;

  @ViewColumn()
  method: PaymentMethod;

  @ViewColumn()
  autoPaid: boolean;

  @ViewColumn()
  creditTransactionId: string;

  @ViewColumn()
  usedCreditAmount: number;
}
