
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
import { provisionSubscriptionPurchase } from '../utils/provisionSubscriptionPurchase';
import { commitSubscriptionPurchase } from '../utils/commitSubscriptionPurchase';
import * as _ from 'lodash';
import { UserStripeCustomer } from '../entity/UserStripeCustomer';
import { previsionStripePayment, createStripeSetupSetupIntent, chargeStripe } from '../services/stripeService';

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

  const payment = await provisionSubscriptionPurchase(userId, plan, recurring, symbols, preferToUseBalance, alertDays, req.ip);
  const { method } = payment;
  const result: any = {
    method
  };
  switch (method) {
    case PaymentMethod.Balance:
      // Does nothing
      break;
    case PaymentMethod.BalanceCardMix:
    case PaymentMethod.Card:
      const clientSecret = recurring ? await createStripeSetupSetupIntent(payment) : await previsionStripePayment(payment);
      result.clientSecret = clientSecret;
      result.paymentId = payment.id;
      result.subscriptionId = payment.subscription.id;
      break;
    case PaymentMethod.PayPal:
      break;
    case PaymentMethod.AliPay:
      break;
    default:
      assert(false, 500, `Unknown payment method ${method}`);
  }

  res.json(result);
});

export const confirmStripeCardPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;

  const payment = await getRepository(Payment).findOne({
    id,
    userId,
  });
  assert(payment, 404);
  const { method } = payment;

  switch (method) {
    case PaymentMethod.Balance:
      // Immidiately commit the subscription purchase if it can be paied fully by balance
      await commitSubscriptionPurchase(payment.id, null, null);
      break;
    case PaymentMethod.BalanceCardMix:
    case PaymentMethod.Card:
      const { stripePaymentMethodId } = req.body;
      const rawResponse = await chargeStripe(payment, stripePaymentMethodId);
      await commitSubscriptionPurchase(id, rawRequest, rawResponse);
      break;
    case PaymentMethod.PayPal:
      break;
    case PaymentMethod.AliPay:
      break;
    default:
      assert(false, 500, `Unknown payment method ${method}`);
  }


  res.json();
});

export const commitSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  // const { id: subscriptionId } = req.params;
  // const { user: { id: userId } } = req as any;
  // const { paidAmount, paymentMethod, rawRequest, rawResponse } = req.body;
  // assert(_.isNumber(paidAmount), 400, 'Invalid paidAmount');

  // await commitSubscriptionPurchase(id, rawRequest, rawResponse);
  res.json();
});

export const calculateNewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { type, symbols, preferToUseBalance } = req.body;
  const result = await calculateNewSubscriptionPaymentDetail(null, userId, type, preferToUseBalance, symbols);
  res.json(result);
});

