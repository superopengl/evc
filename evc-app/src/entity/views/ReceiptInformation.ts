import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentMethod } from '../../types/PaymentMethod';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { User } from '../User';
import { Payment } from '../Payment';
import { UserCreditTransaction } from '../UserCreditTransaction';
import { PaymentStatus } from '../../types/PaymentStatus';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Payment, 'p')
    .innerJoin(Subscription, 's', 'p."subscriptionId" = s.id')
    .innerJoin(User, 'u', 'p."userId" = u.id')
    .leftJoin(UserCreditTransaction, 'c', 'p."creditTransactionId" = c.id')
    .where(`p.status = '${PaymentStatus.Paid}'`)
    .orderBy('p."paidAt"', 'DESC')
    .select([
      'p.id as "paymentId"',
      's.id as "subscriptionId"',
      's.type as "subscriptionType"',
      'p."userId" as "userId"',
      'p.method as method',
      `to_char(p."paidAt", 'YYYYMMDD-') || lpad(u."seqId"::text, 6, '0') as "receiptNumber"`,
      'p."paidAt" as "paidAt"',
      'p.start as start',
      'p.end as end',
      'p.amount as payable',
      '-c.amount as deduction'
    ])
})
export class ReceiptInformation {
  @ViewColumn()
  @PrimaryColumn()
  paymentId: string;

  @ViewColumn()
  subscriptionId: string;

  @ViewColumn()
  subscriptionType: SubscriptionType;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  method: PaymentMethod;

  @ViewColumn()
  receiptNumber: string;

  @ViewColumn()
  paidAt: Date;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  deduction: number;
}
