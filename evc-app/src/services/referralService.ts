import * as _ from 'lodash';
import { EntityManager, getRepository } from 'typeorm';
import { User } from '../entity/User';
import { ReferralUserPolicy } from '../entity/ReferralUserPolicy';
import { ReferralGlobalPolicy } from '../entity/ReferralGlobalPolicy';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from '../utils/getSubscriptionPrice';

export async function getCurrentGlobalReferralCommission() {
  const globalPolicy = await getRepository(ReferralGlobalPolicy)
    .createQueryBuilder()
    .where({ active: true })
    .andWhere('"start" <= CURRENT_DATE')
    .andWhere('("end" IS NULL OR "end" > CURRENT_DATE)')
    .getOne();

  return +(globalPolicy?.amount) || 0;
}

export async function getCurrentSpecialReferralCommissionForUser(userId) {
  const policy = await getRepository(ReferralUserPolicy).findOne(userId);
  return policy ? +(policy.amount) : null;
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
    if (percentage > 0) {
      const ubt = new UserCreditTransaction();
      ubt.referredUserId = userId;
      ubt.userId = referrerUserId;
      ubt.amount = percentage * subscriptionPrice;
      ubt.type = 'commission';
      entitiesToSave.push(ubt);
    }
  }

  await m.save(entitiesToSave);
}