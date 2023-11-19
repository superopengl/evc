import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { User } from '../User';
import { UserCommissionDiscountPolicy } from './UserCommissionDiscountPolicy';




@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(User, 'u')
    .leftJoin(UserCommissionDiscountPolicy, 'up', `u.id = up."userId"`)
    .leftJoin(UserCommissionDiscountPolicy, 'cd', `u."referredBy" = cd."userId"`)
    .select([
      'up.*',
      'u."everPaid" as "everPaid"',
      'u."referredBy" as "referredBy"',
      'CASE WHEN u."everPaid" THEN 0 ELSE coalesce(cd."referreeDiscountPerc", NULL) END as "my1stBuyDiscountPerc"',
    ])
})
export class UserCommissionDiscountInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  referralCount: string;

  @ViewColumn()
  globalReferralCommissionPerc: number;

  @ViewColumn()
  specialReferralCommissionPerc: number;

  @ViewColumn()
  referralCommissionPerc: number;

  @ViewColumn()
  globalReferreeDiscountPerc: number;

  @ViewColumn()
  specialReferreeDiscountPerc: number;

  @ViewColumn()
  referreeDiscountPerc: number;

  @ViewColumn()
  everPaid: boolean;

  @ViewColumn()
  referredBy: string;

  @ViewColumn()
  my1stBuyDiscountPerc: number;
}
