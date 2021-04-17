import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getUserCreditBalance } from './getUserCreditBalance';
import { calculateAmountToPay } from './calculateAmountToPay';

export async function calculateNewSubscriptionPaymentDetail(
  userId: string,
  subscriptionType: SubscriptionType,
  preferToUseCredit: boolean,
) {
  const price = getSubscriptionPrice(subscriptionType);
  const totalCreditAmount = await getUserCreditBalance(userId);
  const { creditDeductAmount, additionalPay } = calculateAmountToPay(preferToUseCredit ? totalCreditAmount : 0, price);
  const result = {
    price,
    totalCreditAmount,
    creditDeductAmount,
    additionalPay,
  };
  return result;
}
