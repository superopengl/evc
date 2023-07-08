import { getRepository, LessThan, In } from 'typeorm';
import { Stock } from '../entity/Stock';
import { getUtcNow } from './getUtcNow';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';


export async function getUserCurrentSubscription(userId) {
  const now = getUtcNow();

  const subscription = await getRepository(Subscription)
    .createQueryBuilder()
    .where({
      userId,
      start: LessThan(now),
      status: SubscriptionStatus.Alive
    })
    .andWhere(`"end" IS NULL OR "end" > :now`, { now })
    .getOne();

  return subscription;
}
