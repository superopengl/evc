import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { Subscription } from './Subscription';
import { Payment } from './Payment';
import { UserBalanceTransaction } from './UserBalanceTransaction';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
  .from(Subscription, 's')
  .innerJoin(q => q.from(Payment, 'p').where(`p.status = 'paid'`), 'p', `p."subscriptionId" = s.id`)
  .leftJoin(q => q.from(UserBalanceTransaction, 'b'), 'b', 'p."balanceTransactionId" = b.id')
  .orderBy('s.start', 'DESC')
  .addOrderBy('p."lastUpdatedAt"', 'DESC')
  .select([
    `s."userId" as "userId"`,
    `s.id as "subscriptionId"`,
    `p.id as "paymentId"`,
    `p."balanceTransactionId" as "balanceTransactionId"`,
    `s.start as start`,
    `s.end as end`,
    `s.type as type`,
    `s.status as "subscriptionStatus"`,
    `p."lastUpdatedAt" as "paymentLastUpdatedAt"`,
    `p."amount" as "paidAmount"`,
    `-b."amount" as "usedBalanceAmount"`,
    `p."method" as "method"`,
    `p."auto" as "autoPaid"`,
  ])
})
export class SubscriptionPaymentBalanceInformation {
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
  balanceTransactionId: string;

  @ViewColumn()
  usedBalanceAmount: number;
}
