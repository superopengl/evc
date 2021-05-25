import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { PaymentMethod } from '../../types/PaymentMethod';
import { SubscriptionType } from '../../types/SubscriptionType';
import { RevenueChartInformation } from './RevenueChartInformation';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(RevenueChartInformation, 'r')
    .where(`r."payableCny" IS NOT NULL`)
    .orderBy('r."date"', 'DESC')
    .select([
      'r."subscriptionType"',
      'r."method"',
      'r."date"',
      'r."isNZ"',
      'r."price"',
      'r."payableCny" as payable',
      'r."deduction"',
      'r."year"',
      'r."month"',
      'r."week"',
      'r."day"',
    ])
})
export class RevenueCnyChartInformation {
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
