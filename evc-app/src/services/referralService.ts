import * as _ from 'lodash';
import { EntityManager, getRepository } from 'typeorm';
import { User } from '../entity/User';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from '../utils/getSubscriptionPrice';
import { UserCommissionDiscountPolicy } from '../entity/views/UserCommissionDiscountPolicy';

export async function handleReferralCommissionWhenPaid(m: EntityManager, userId: string, subscriptionType: SubscriptionType) {
  const user = await m.getRepository(User).findOne(userId);
  if (user.everPaid) {
    return;
  }

  user.everPaid = true;
  const entitiesToSave: any[] = [user];
  const { referredBy: referrerUserId } = user;
  if (referrerUserId) {
    const { referralCommissionPerc } = await getRepository(UserCommissionDiscountPolicy).findOne(referrerUserId);
    const subscriptionPrice = getSubscriptionPrice(subscriptionType);
    const ubt = new UserCreditTransaction();
    ubt.referredUserId = userId;
    ubt.userId = referrerUserId;
    ubt.amount = referralCommissionPerc * subscriptionPrice;
    ubt.type = 'commission';
    entitiesToSave.push(ubt);
  }

  await m.save(entitiesToSave);
}