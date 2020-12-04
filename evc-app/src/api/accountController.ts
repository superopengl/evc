
import { getManager, getRepository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import * as moment from 'moment';
import { StockSearch } from '../entity/StockSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { Subscription } from '../entity/Subscription';
import { Subject } from 'rxjs';
import { redisCache } from '../services/redisCache';
import { ReferralCode } from '../entity/ReferralCode';
import { getUserSubscription } from '../utils/getUserSubscription';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';
import { ReferralUserPolicy } from '../entity/ReferralUserPolicy';

export const createReferral = async (userId) => {
  const entity = new ReferralCode();
  entity.id = uuidv4();
  entity.userId = userId;
  await getRepository(ReferralCode).insert(entity);
  return entity;
}

const getAccountForUser = async (userId) => {
  // const user = await getRepository(User).findOne({ id: userId });
  const referralUrl = `${process.env.EVC_WEB_DOMAIN_NAME}/signup?code=${userId}`;

  const referralCount = await getRepository(User)
    .createQueryBuilder()
    .where({ referredBy: userId, everPaid: true })
    .getCount();

  const subscription = await getUserSubscription(userId);

  const balance = await getRepository(UserBalanceTransaction)
    .createQueryBuilder()
    .where({ userId })
    .select(`SUM(amount) AS amount`)
    .getRawOne();


  const referralPolicy = await getRepository(ReferralUserPolicy).findOne(userId);

  const result = {
    subscription,
    referralPolicy,
    referralUrl,
    referralCount,
    balance: +balance?.amount || 0
  };

  return result;
}

export const getAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const result = await getAccountForUser(id);

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
    const entity = new UserBalanceTransaction();
    entity.id = uuidv4();
    entity.userId = id;
    entity.amount = amount;

    await getRepository(UserBalanceTransaction).insert(entity);
  }

  res.json();
});