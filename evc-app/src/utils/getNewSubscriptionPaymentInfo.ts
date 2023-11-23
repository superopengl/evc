import { SubscriptionType } from '../types/SubscriptionType';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { getUserCreditBalance } from './getUserCreditBalance';
import { getRepository } from 'typeorm';
import { UserCommissionDiscountInformation } from '../entity/views/UserCommissionDiscountInformation';
import { getConfigValue } from '../services/configService';

export async function getNewSubscriptionPaymentInfo(
  userId: string,
  subscriptionType: SubscriptionType,
) {
  const fullPrice = getSubscriptionPrice(subscriptionType);
  const creditBalance = await getUserCreditBalance(userId);
  const { my1stBuyDiscountPerc } = await getRepository(UserCommissionDiscountInformation).findOne(userId);
  const price = fullPrice * (1 - (my1stBuyDiscountPerc || 0));
  const usdToCnyRate = +(await getConfigValue('pricing.usdToCnyExchangeRate')) || 6.8;
  const priceCny = price * usdToCnyRate;
  const result = {
    price,
    priceCny,
    creditBalance,
  };
  return result;
}
