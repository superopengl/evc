import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { PaymentStatus } from '../../types/PaymentStatus';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { SubscriptionType } from '../../types/SubscriptionType';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Subscription, 's')
    .where(`s.status = '${SubscriptionStatus.Alive}'`)
    .innerJoin(q => q
      .from(Payment, 'p')
      .where(`status = '${PaymentStatus.Paid}'`)
      .andWhere(`CURRENT_DATE between start and "end"`)
      .distinctOn(['"subscriptionId"', 'type'])
      .orderBy('"subscriptionId"')
      .addOrderBy('type'),
      'p', 'p."subscriptionId" = s.id')
    .orderBy('s.start', 'DESC')
    .addOrderBy('p."lastUpdatedAt"', 'DESC')
    .select([
      's.id as id',
      's."userId" as "userId"',
      's.recurring as recurring',
      's.start as start',
      's."end" as end',
      'p.type as type'
    ])
})
export class UserCurrentSubscriptionInformation {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  type: SubscriptionType;
}
