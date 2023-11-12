import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { User } from '../User';
import { CommissionGlobalPolicy } from '../CommissionGlobalPolicy';
import { CommissionUserPolicy } from '../CommissionUserPolicy';
import { DiscountGlobalPolicy } from '../DiscountGlobalPolicy';
import { DiscountUserPolicy } from '../DiscountUserPolicy';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(User, 'u')
    .leftJoin(q => q
      .from(User, 'usr')
      .where(`"everPaid" IS TRUE`)
      .andWhere(`"referredBy" IS NOT NULL`)
      .groupBy('"referredBy"')
      .select([
        '"referredBy"',
        'COUNT(1) as "referralCount"'
      ]),
      'ru', 'u.id = ru."referredBy"')
    .leftJoin(q => q
      .from(CommissionGlobalPolicy, 'gc')
      .where(`active IS TRUE`)
      .andWhere('"start" <= CURRENT_DATE')
      .andWhere('("end" IS NULL OR "end" > CURRENT_DATE)')
      .distinctOn(['percentage'])
      .orderBy('percentage', 'DESC')
      , 'gc', '1=1')
    .leftJoin(CommissionUserPolicy, 'uc', 'u.id = uc."userId"')
    .leftJoin(q => q
      .from(DiscountGlobalPolicy, 'gd')
      .where(`active IS TRUE`)
      .andWhere('"start" <= CURRENT_DATE')
      .andWhere('("end" IS NULL OR "end" > CURRENT_DATE)')
      .distinctOn(['percentage'])
      .orderBy('percentage', 'DESC')
      , 'gd', '1=1')
    .leftJoin(DiscountUserPolicy, 'ud', 'u.id = ud."userId"')
    .select([
      'u.id as "userId"',
      'coalesce(ru."referralCount", 0) as "referralCount"',
      'coalesce(gc.percentage, 0) as "globalReferralCommissionPerc"',
      'coalesce(uc.percentage, 0) as "specialReferralCommissionPerc"',
      'coalesce(uc.percentage, gc.percentage) as "referralCommissionPerc"',
      'coalesce(gd.percentage, 0) as "globalReferreeDiscountPerc"',
      'coalesce(ud.percentage, 0) as "specialReferreeDiscountPerc"',
      'coalesce(ud.percentage, gd.percentage) as "referreeDiscountPerc"',
    ])
})
export class UserCommissionDiscountPolicy {
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
}
