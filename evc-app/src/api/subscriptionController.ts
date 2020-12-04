
import { EntityManager, getManager, getRepository, Like, MoreThan, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import * as moment from 'moment';
import { logError } from '../utils/logger';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { Payment } from '../entity/Payment';
import { PaymentMethod } from '../types/PaymentMethod';
import { calculateNewSubscriptionPaymentDetail } from '../utils/calculateNewSubscriptionPaymentDetail';
import { provisionSubscriptionPurchase } from '../utils/provisionSubscriptionPurchase';
import { commitSubscription } from '../utils/commitSubscription';
import * as _ from 'lodash';
import { createStripeClientSecret, chargeStripe } from '../services/stripeService';

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
    method,
    paymentId: payment.id,
    subscriptionId: payment.subscription.id,
  };
  switch (method) {
    case PaymentMethod.Balance:
      // Does nothing
      break;
    case PaymentMethod.BalanceCardMix:
    case PaymentMethod.Card:
      const clientSecret = await createStripeClientSecret(payment);
      result.clientSecret = clientSecret;
      break;
    case PaymentMethod.PayPal:
      assert(false, 501);
      break;
    case PaymentMethod.AliPay:
      assert(false, 501);
      break;
    default:
      assert(false, 500, `Unknown payment method ${method}`);
  }

  res.json(result);
});

export const confirmSubscriptionPayment = handlerWrapper(async (req, res) => {
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
      await commitSubscription(payment.id, null);
      break;
    case PaymentMethod.BalanceCardMix:
    case PaymentMethod.Card:
      const { stripePaymentMethodId } = req.body;
      const rawResponse = await chargeStripe(payment, stripePaymentMethodId);
      await commitSubscription(id, rawResponse);
      break;
    case PaymentMethod.PayPal:
      assert(false, 501);
      break;
    case PaymentMethod.AliPay:
      assert(false, 501);
      break;
    default:
      assert(false, 500, `Unknown payment method ${method}`);
  }


  res.json();
});

export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  const { type, symbols, preferToUseBalance } = req.body;
  const result = await calculateNewSubscriptionPaymentDetail(null, userId, type, preferToUseBalance, symbols);
  res.json(result);
});

