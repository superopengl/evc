
import { EntityManager, getManager, getRepository, Like, MoreThan, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
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
import { Payment } from '../entity/Payment';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { calculateNewSubscriptionPaymentDetail } from '../utils/calculateNewSubscriptionPaymentDetail';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';
import { provisionSubscriptionTransaction } from '../utils/provisionSubscriptionTransaction';
import { commitSubscriptionTransactionAfterInitalPay } from '../utils/commitSubscriptionTransactionAfterInitalPay';
import * as _ from 'lodash';

async function getUserSubscriptionHistory(userId) {
  const list = await getRepository(Subscription).find({
    where: {
      userId,
      status: In([SubscriptionStatus.Alive, SubscriptionStatus.Expired, SubscriptionStatus.Terminated])
    },
    order: {
      start: 'DESC',
      createdAt: 'DESC',
    },
    relations: [
      'payments'
    ]
  });

  return list;
}

export const listMySubscriptionHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;

  const list = await getUserSubscriptionHistory(userId);

  res.json(list);
});

export const listUserSubscriptionHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;

  const list = await getUserSubscriptionHistory(id);

  res.json(list);
});

export const cancelSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;

  await getRepository(Subscription).update(
    { id, userId },
    { 
      end: getUtcNow(),
      status: SubscriptionStatus.Terminated
    }
  );

  res.json();
});

export const getMyCurrnetSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;

  const subscription = await getRepository(Subscription).findOne(
    { userId, status: SubscriptionStatus.Alive }
  );

  res.json(subscription);
});

export const provisionSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { plan, recurring, symbols, preferToUseBalance, alertDays } = req.body;

  const subscription = await provisionSubscriptionTransaction(userId, plan, recurring, symbols, preferToUseBalance, alertDays);
  res.json(subscription);
});

export const commitSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;
  const { paidAmount, paymentMethod, rawRequest, rawResponse } = req.body;
  assert(_.isNumber(paidAmount), 400, 'Invalid paidAmount');

  await commitSubscriptionTransactionAfterInitalPay(id, userId, paidAmount, paymentMethod, rawRequest, rawResponse, false, req.ip);
  res.json();
});

export const calculateNewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { type, symbols, preferToUseBalance } = req.body;
  const result = await calculateNewSubscriptionPaymentDetail(null, userId, type, preferToUseBalance, symbols);
  res.json(result);
});

