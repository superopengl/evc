import { SubscriptionType } from '../types/SubscriptionType';
import { Subscription } from '../entity/Subscription';
import * as _ from 'lodash';
import { getUnitPricing } from './getUnitPricing';
import { assert } from './assert';


export function getSubscriptionPrice(type: SubscriptionType) {
  const unitPrice = getUnitPricing(type);
  return unitPrice;
}
