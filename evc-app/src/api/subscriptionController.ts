
import { EntityManager, getManager, getRepository, Like, MoreThan } from 'typeorm';
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
      userId
    },
    order: {
      start: 'DESC'
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
    { status: SubscriptionStatus.Terminated }
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

function createPaymentEntity(payload): Payment {
  const { paymentMethod, balanceAmount, paymentInfo } = payload;
  const entity = new Payment();
  entity.id = uuidv4();
  entity.balanceTransaction = balanceAmount;
  entity.amount = 0;
  entity.method = paymentMethod;
  entity.status = PaymentStatus.OK;
  return entity;
}

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


export const createSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { plan, recurring, symbols, alertDays } = req.body;
  const now = getUtcNow();

  const months = recurring ? null : plan === SubscriptionType.UnlimitedQuarterly ? 3 : 1;
  const end = months ? moment(now).add(months, 'month').toDate() : null;

  const payment = createPaymentEntity(req.body);

  const subscriptionId = uuidv4();
  const subscription = new Subscription();
  subscription.id = subscriptionId;
  subscription.userId = userId;
  subscription.type = plan;
  subscription.symbols = plan === SubscriptionType.SelectedMonthly ? symbols : [];
  subscription.start = now;
  subscription.end = end;
  subscription.status = SubscriptionStatus.Alive;

  await getManager().transaction(async m => {
    // Terminates all ongoing subscriptions
    await m.getRepository(Subscription).update(
      { userId, status: SubscriptionStatus.Alive },
      { status: SubscriptionStatus.Terminated }
    );

    await m.save(payment);

    subscription.payments = [payment];
    await m.save(subscription);
  });

  res.json(subscription);
});

export const calculateNewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { type, symbols, preferToUseBalance } = req.body;
  const result = await calculateNewSubscriptionPaymentDetail(null, userId, type, preferToUseBalance, symbols);
  res.json(result);
});

