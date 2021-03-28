import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getUserCredit } from './getUserCredit';
import { calculateAmountToPay } from './calculateAmountToPay';
import { EntityManager } from 'typeorm';

export async function calculateNewSubscriptionPaymentDetail(
  entityManager: EntityManager,
  userId: string,
  subscriptionType: SubscriptionType,
  preferToUseCredit: boolean,
) {
  const price = getSubscriptionPrice(subscriptionType);
  const totalCreditAmount = await getUserCredit(entityManager, userId);
  const { creditDeductAmount, additionalPay } = calculateAmountToPay(preferToUseCredit ? totalCreditAmount : 0, price);
  const result = {
    price,
    totalCreditAmount,
    creditDeductAmount,
    additionalPay,
  };
  return result;
}
