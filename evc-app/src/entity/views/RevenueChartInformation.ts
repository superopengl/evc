import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { PaymentMethod } from '../../types/PaymentMethod';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { UserCreditTransaction } from '../UserCreditTransaction';
import { PaymentStatus } from '../../types/PaymentStatus';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
  .from(Payment, 'p')
  .innerJoin(Subscription, 's', 'p."subscriptionId" = s.id')
  .leftJoin(UserCreditTransaction, 'c', 'p."creditTransactionId" = c.id')
  .where(`p.status = '${PaymentStatus.Paid}'`)
  .orderBy('p."paidAt"', 'DESC')
  .select([
    's.type as "subscriptionType"',
    'p.method as method',
    'p."paidAt" as date',
    `case when p.geo ->> 'country' = 'NZ' then true else false end as "isNZ"`,
    'coalesce(p.amount, 0) - coalesce(c.amount, 0) as price',
    'coalesce(p.amount, 0) as payable',
    'coalesce(-c.amount, 0) as deduction',
    `to_char("paidAt", 'YYYY') as year`,
    `to_char("paidAt", 'YYYY/MM') as month`,
    `to_char("paidAt", 'YYYY/"w"IW') as week`,
    `to_char("paidAt", 'YYYY/MM/DD') as day`,
  ])
})
export class RevenueChartInformation {
  @ViewColumn()
  subscriptionType: SubscriptionType;

  @ViewColumn()
  method: PaymentMethod;

  @ViewColumn()
  date: Date;

  @ViewColumn()
  isNZ: boolean;

  @ViewColumn()
  price: number;

  @ViewColumn()
  payable: number;

  @ViewColumn()
  deduction: number;

  @ViewColumn()
  year: string;

  @ViewColumn()
  month: string;

  @ViewColumn()
  week: string;

  @ViewColumn()
  day: string;
}
