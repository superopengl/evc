import { SubscriptionType } from '../types/SubscriptionType';
import { assert } from './assert';

export function getSubscriptionName(type: SubscriptionType) {
  switch (type) {
    case SubscriptionType.Free:
      return 'Free';
    case SubscriptionType.UnlimitedMontly:
      return 'Pro Member Monthly';
    case SubscriptionType.UnlimitedYearly:
      return 'Pro Member Annually';
    default:
      assert(false, 500, `Unsupported subscription type ${type}`);
  }
}
