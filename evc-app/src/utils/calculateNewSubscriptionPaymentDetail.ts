import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getUserBalance } from './getUserBalance';
import { calculateAmountToPay } from './calculateAmountToPay';
import { EntityManager } from 'typeorm';

export async function calculateNewSubscriptionPaymentDetail(
  entityManager: EntityManager,
  userId: string,
  subscriptionType: SubscriptionType,
  preferToUseBalance: boolean,
) {
  const price = getSubscriptionPrice(subscriptionType);
  const totalBalanceAmount = await getUserBalance(entityManager, userId);
  const { balanceDeductAmount, additionalPay } = calculateAmountToPay(preferToUseBalance ? totalBalanceAmount : 0, price);
  const result = {
    price,
    totalBalanceAmount,
    balanceDeductAmount,
    additionalPay,
  };
  return result;
}
