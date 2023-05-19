
export const getSubscriptionName = (type) => {
  return {
    free: 'subscription.free',
    selected_monthly: 'subscription.selected_monthly',
    unlimited_monthly: 'subscription.unlimited_monthly',
    unlimited_quarterly: 'subscription.unlimited_quarterly'
  }[type];
};
