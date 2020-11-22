
import { getManager, getRepository, Like, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { StockHistory } from '../entity/StockHistory';
import * as moment from 'moment';
import { StockSearch } from '../entity/StockSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { getUserSubscription } from '../utils/getUserSubscription';

export const listSubscriptionHistory = handlerWrapper(async (req, res) => {
  assert(false, 501);

});

export async function createInitialFreeSubscription(userId) {
  const sub = new Subscription();
  Object.assign(sub, {
    userId,
    type: SubscriptionType.Free,
    start: getUtcNow(),
    status: SubscriptionStatus.Enabled
  });

  await getRepository(Subscription).save(sub);
}

export const cancelSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;

  await getRepository(Subscription).update(
    { id, userId },
    { status: SubscriptionStatus.Disabled }
  );

  res.json();
});

export const provisionSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { plan, recurring, symbols, alertDays } = req.body;
  const now = getUtcNow();

  const repo = getRepository(Subscription);
  const existing = await repo.findOne({
    userId,
    status: SubscriptionStatus.Provisioning,
  });
  assert(!existing, 500, 'Cannot provision this subscription as you already have a provisioning subscription.');

  const months = recurring ? null : plan === SubscriptionType.UnlimitedQuarterly ? 3 : 1;
  const end = months ? moment(now).add(months, 'month').toDate() : null;

  const subscriptionId = uuidv4();
  const subscription = new Subscription();
  subscription.id = subscriptionId;
  subscription.userId = userId;
  subscription.type = plan;
  subscription.symbols = plan === SubscriptionType.SelectedMonthly ? symbols : [];
  subscription.start = now;
  subscription.end = end;
  subscription.status = SubscriptionStatus.Provisioning;

  await getRepository(Subscription).insert(subscription);

  res.json(subscription);
});

export const settleSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { id } = req.params;

  await getRepository(Subscription).update(
    { userId, id, status: SubscriptionStatus.Provisioning },
    { status: SubscriptionStatus.Enabled }
  );

  res.json();
});

