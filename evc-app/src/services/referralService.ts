import * as _ from 'lodash';
import { EntityManager, getRepository } from 'typeorm';
import { User } from '../entity/User';
import { CommissionUserPolicy } from '../entity/CommissionUserPolicy';
import { CommissionGlobalPolicy } from '../entity/CommissionGlobalPolicy';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from '../utils/getSubscriptionPrice';
import { DiscountGlobalPolicy } from '../entity/DiscountGlobalPolicy';
import { DiscountUserPolicy } from '../entity/DiscountUserPolicy';

export async function getCurrentGlobalReferralCommission() {
  const globalPolicy = await getRepository(CommissionGlobalPolicy)
    .createQueryBuilder()
    .where({ active: true })
    .andWhere('"start" <= CURRENT_DATE')
    .andWhere('("end" IS NULL OR "end" > CURRENT_DATE)')
    .getOne();

  return +(globalPolicy?.percentage) || 0;
}

export async function getCurrentGlobalReferreeDiscount() {
  const globalPolicy = await getRepository(DiscountGlobalPolicy)
    .createQueryBuilder()
    .where({ active: true })
    .andWhere('"start" <= CURRENT_DATE')
    .andWhere('("end" IS NULL OR "end" > CURRENT_DATE)')
    .getOne();

  return +(globalPolicy?.percentage) || 0;
}

export async function getCurrentSpecialReferralCommissionForUser(userId) {
  const policy = await getRepository(CommissionUserPolicy).findOne(userId);
  return policy ? +(policy.percentage) : null;
}

export async function getCurrentUserSpecialReferreeDiscount(userId) {
  const policy = await getRepository(DiscountUserPolicy).findOne(userId);
  return policy ? +(policy.percentage) : null;
}

export async function getCurrentReferralAmountForReferrer(userId) {
  const spacial = await getCurrentSpecialReferralCommissionForUser(userId);
  if (spacial) {
    return spacial;
  }
  return await getCurrentGlobalReferralCommission();
}

export async function handleReferralCommissionWhenPaid(m: EntityManager, userId: string, subscriptionType: SubscriptionType) {
  const user = await m.getRepository(User).findOne(userId);
  if (user.everPaid) {
    return;
  }

  user.everPaid = true;
  const entitiesToSave: any[] = [user];
  const { referredBy: referrerUserId } = user;
  if (referrerUserId) {
    const percentage = await getCurrentReferralAmountForReferrer(referrerUserId);
    const subscriptionPrice = getSubscriptionPrice(subscriptionType);
    const ubt = new UserCreditTransaction();
    ubt.referredUserId = userId;
    ubt.userId = referrerUserId;
    ubt.amount = percentage * subscriptionPrice;
    ubt.type = 'commission';
    entitiesToSave.push(ubt);
  }

  await m.save(entitiesToSave);
}