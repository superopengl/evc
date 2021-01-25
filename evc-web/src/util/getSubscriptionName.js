
export const getSubscriptionName = (type) => {
  return {
    free: 'subscription.free',
    unlimited_monthly: 'subscription.unlimited_monthly',
    unlimited_quarterly: 'subscription.unlimited_quarterly'
  }[type];
};
