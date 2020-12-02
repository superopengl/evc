import { SubscriptionType } from '../types/SubscriptionType';
import { Subscription } from '../entity/Subscription';
import * as _ from 'lodash';
import { getUnitPricing } from './getUnitPricing';
import { assert } from './assert';


export function getSubscriptionPrice(type: SubscriptionType, symbols: string[]) {
  const unitPrice = getUnitPricing(type);
  if (type === SubscriptionType.SelectedMonthly) {
    assert(symbols?.length, 400, 'No stocks selected for the montly selected plan');
    return unitPrice * _.uniq(symbols).length;
  } else {
    return unitPrice;
  }
}
