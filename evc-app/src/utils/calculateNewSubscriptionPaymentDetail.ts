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
  selectedSymbols: string[]
) {
  const price = getSubscriptionPrice(subscriptionType, selectedSymbols);
  const totalBalanceAmount = await getUserBalance(entityManager, userId);
  const { balanceDeductAmount, additionalPay, paymentMethod } = calculateAmountToPay(preferToUseBalance ? totalBalanceAmount : 0, price);
  const result = {
    price,
    totalBalanceAmount,
    balanceDeductAmount,
    additionalPay,
    paymentMethod,
  };
  return result;
}
