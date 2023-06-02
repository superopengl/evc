import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { getUtcNow } from './getUtcNow';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';

export async function provisionSubscriptionTransaction(
  userId: string,
  plan: SubscriptionType,
  recurring: boolean,
  symbols: string[],
  preferToUseBalance: boolean,
  alertDays: number
) {
  const now = getUtcNow();

  const months = plan === SubscriptionType.UnlimitedQuarterly ? 3 : 1;
  const end = moment(now).add(months, 'month').toDate();

  const subscriptionId = uuidv4();
  const subscription = new Subscription();
  subscription.id = subscriptionId;
  subscription.userId = userId;
  subscription.type = plan;
  subscription.symbols = plan === SubscriptionType.SelectedMonthly ? symbols : [];
  subscription.recurring = recurring;
  subscription.start = now;
  subscription.end = end;
  subscription.preferToUseBalance = preferToUseBalance;
  subscription.alertDays = alertDays;
  subscription.status = SubscriptionStatus.Provisioning;

  await getRepository(Subscription).insert(subscription);

  return subscription;
}

