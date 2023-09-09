import { SubscriptionType } from '../types/SubscriptionType';

export function getUnitPricing(type: SubscriptionType) {
  switch (type) {
  case SubscriptionType.Free:
    return 0;
  case SubscriptionType.UnlimitedMontly:
    return 29;
  case SubscriptionType.UnlimitedYearly:
    return 319;
  default:
    throw new Error(`Unknown subscription type ${type}`);
  }
}

