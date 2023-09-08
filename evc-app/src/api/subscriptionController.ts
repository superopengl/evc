
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
import { Role } from '../types/Role';

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
  assertRole(req, 'member', 'free');
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
  assertRole(req, 'member', 'free');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;

  await getRepository(Subscription).update(
    { id, userId },
    {
      end: getUtcNow(),
      status: SubscriptionStatus.Terminated
    }
  );
  // Change user's role back to free plan
  await getRepository(User).update({ id: userId }, { role: Role.Free });

  res.json();
});

export const getMyCurrnetSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;

  const subscription = await getRepository(Subscription).findOne(
    { userId, status: SubscriptionStatus.Alive }
  );

  res.json(subscription);
});

export const provisionSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;
  const { plan, recurring, preferToUseBalance, alertDays, method } = req.body;

  const payment = await provisionSubscriptionPurchase({
    userId,
    subscriptionType: plan,
    paymentMethod: method,
    recurring,
    preferToUseBalance,
    alertDays,
    ipAddress: req.ip
  });
  const result: any = {
    method,
    amount: payment.amount,
    paymentId: payment.id,
    subscriptionId: payment.subscription.id,
  };
  switch (method) {
    case PaymentMethod.Balance:
    case PaymentMethod.PayPal:
      // No need to do anything extra
      break;
    case PaymentMethod.Card:
      const clientSecret = await createStripeClientSecret(payment);
      result.clientSecret = clientSecret;
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
  assertRole(req, 'member', 'free');
  const { id: paymentId } = req.params;
  const { user } = req as any;
  const userId = user.id;

  const payment = await getRepository(Payment).findOne({
    id: paymentId,
    userId,
  });
  assert(payment, 404);
  const { method } = payment;

  switch (method) {
    case PaymentMethod.Balance:
      // Immidiately commit the subscription purchase if it can be paied fully by balance
      await commitSubscription(paymentId, null);
      break;
    case PaymentMethod.Card:
      const { stripePaymentMethodId } = req.body;
      const rawResponse = await chargeStripe(payment, stripePaymentMethodId);
      await commitSubscription(paymentId, rawResponse);
      break;
    case PaymentMethod.PayPal:
      await commitSubscription(paymentId, req.body);
      break;
    case PaymentMethod.AliPay:
      assert(false, 501, `AliPay is under development`);
      break;
    default:
      assert(false, 500, `Unknown payment method ${method}`);
  }


  res.json();
});

export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;
  const { type, preferToUseBalance } = req.body;
  const result = await calculateNewSubscriptionPaymentDetail(null, userId, type, preferToUseBalance);
  res.json(result);
});

