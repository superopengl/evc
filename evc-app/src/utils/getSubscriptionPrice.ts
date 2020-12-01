import { SubscriptionType } from '../types/SubscriptionType';
import { Subscription } from '../entity/Subscription';
import * as _ from 'lodash';
import { getUnitPricing } from './getUnitPricing';


export function getSubscriptionPrice(subscription: Subscription) {
  const { type, symbols } = subscription;
  const unitPrice = getUnitPricing(type);
  return type === SubscriptionType.SelectedMonthly ? unitPrice * _.uniq(symbols).length : unitPrice;
}
