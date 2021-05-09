import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getUserCreditBalance } from './getUserCreditBalance';

export async function getNewSubscriptionPaymentInfo(
  userId: string,
  subscriptionType: SubscriptionType,
) {
  const price = getSubscriptionPrice(subscriptionType);
  const totalCreditAmount = await getUserCreditBalance(userId);
  const result = {
    price,
    totalCreditAmount,
  };
  return result;
}
