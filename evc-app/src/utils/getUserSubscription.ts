import { getRepository, LessThan, In } from 'typeorm';
import { Stock } from '../entity/Stock';
import { getUtcNow } from './getUtcNow';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';


export async function getUserSubscription(userId) {
  const now = getUtcNow();

  const subscription = await getRepository(Subscription)
    .createQueryBuilder()
    .where({
      userId,
      start: LessThan(now),
      status: SubscriptionStatus.Enabled
    })
    .andWhere(`"end" IS NULL OR "end" > :now`, { now })
    .getOne();

  if (subscription) {
    const stocks = subscription.symbols?.length ? await getRepository(Stock).find({
      symbol: In(subscription.symbols)
    }) : [];
    Object.assign(subscription, { stocks });
  }

  return subscription;
}
