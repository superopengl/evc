
export const getSubscriptionName = (type) => {
  return {
    free: 'subscription.free',
    unlimited_monthly: 'subscription.unlimited_monthly',
    unlimited_yearly: 'subscription.unlimited_yearly'
  }[type];
};
