
import { getManager, getRepository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
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
import { Subject } from 'rxjs';
import { RedisPubSubService } from '../services/RedisPubSubService';
import { redisCache } from '../services/redisCache';
import { ReferralCode } from '../entity/ReferralCode';
import { getUserSubscription } from '../utils/getUserSubscription';
import { UserBalanceLog } from '../entity/UserBalanceLog';

export const createReferral = async (userId) => {
  const entity = new ReferralCode();
  entity.id = uuidv4();
  entity.userId = userId;
  await getRepository(ReferralCode).insert(entity);
  return entity;
}

const getAccountForUser = async (userId) => {
  const referral = await getRepository(ReferralCode).findOne({ userId });
  const referralUrl = `${process.env.EVC_WEB_DOMAIN_NAME}/signup?code=${referral.id}`;

  const referralCountInfo = referral ? await getRepository(User)
    .createQueryBuilder()
    .where({ referralCode: referral.id })
    .select('COUNT(*) AS count')
    .getRawOne() : null;

  const subscription = await getUserSubscription(userId);

  const result = {
    subscription,
    referralUrl,
    referralCount: +(referralCountInfo?.count || 0)
  };

  return result;
}

export const getAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const result = await getAccountForUser(id);
  const balance = await getRepository(UserBalanceLog)
    .createQueryBuilder()
    .where({ userId: id })
    .select(`SUM(amount) AS amount`)
    .getRawOne();

  Object.assign(result, { balance: +balance?.amount || 0 });

  res.json(result);
});

export const getMyAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id } } = req as any;
  const result = await getAccountForUser(id);

  res.json(result);
});


export const adjustBalance = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { amount } = req.body;
  if (amount !== 0) {
    const entity = new UserBalanceLog();
    entity.id = uuidv4();
    entity.userId = id;
    entity.amount = amount;

    await getRepository(UserBalanceLog).insert(entity);
  }

  res.json();
});