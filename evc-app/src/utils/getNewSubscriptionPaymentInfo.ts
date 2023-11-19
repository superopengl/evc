import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getUserCreditBalance } from './getUserCreditBalance';
import { getRepository } from 'typeorm';
import { UserCommissionDiscountInformation } from '../entity/views/UserCommissionDiscountInformation';

export async function getNewSubscriptionPaymentInfo(
  userId: string,
  subscriptionType: SubscriptionType,
) {
  const fullPrice = getSubscriptionPrice(subscriptionType);
  const creditBalance = await getUserCreditBalance(userId);
  const { my1stBuyDiscountPerc } = await getRepository(UserCommissionDiscountInformation).findOne(userId);
  const price = fullPrice * (1 - (my1stBuyDiscountPerc || 0));
  const result = {
    price,
    creditBalance,
  };
  return result;
}
