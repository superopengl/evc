import { SubscriptionType } from '../types/SubscriptionType';

export function getUnitPricing(type: SubscriptionType) {
  switch (type) {
    case SubscriptionType.Free:
      return 0;
    case SubscriptionType.UnlimitedMontly:
      return 39.99;
    case SubscriptionType.UnlimitedQuarterly:
      return 109.99;
    default:
      throw new Error(`Unknown subscription type ${type}`);
  }
}

