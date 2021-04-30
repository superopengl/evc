
import { getRepository, In } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { Payment } from '../entity/Payment';
import { PaymentMethod } from '../types/PaymentMethod';
import { calculateNewSubscriptionPaymentDetail } from '../utils/calculateNewSubscriptionPaymentDetail';
import { provisionSubscriptionPurchase } from '../utils/provisionSubscriptionPurchase';
import { commitSubscription } from '../utils/commitSubscription';
import * as _ from 'lodash';
import { createStripeClientSecretForCardPayment, chargeStripeForCardPayment } from '../services/stripeService';
import { generateReceiptPdfStream } from '../services/receiptService';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { UserCurrentSubscription } from '../entity/views/UserCurrentSubscription';

async function getUserSubscriptionHistory(userId) {
  const list = await getRepository(Subscription).find({
    where: {
      userId,
      status: In([SubscriptionStatus.Alive])
    },
    order: {
      start: 'ASC',
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

export const turnOffSubscriptionRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;

  await getRepository(Subscription).update(
    {
      userId,
      status: SubscriptionStatus.Alive,
      recurring: true,
    },
    {
      recurring: false,
    }
  );

  res.json();
});

export const downloadPaymentReceipt = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { id } = req.params;
  const { user } = req as any;

  const receipt = await getRepository(ReceiptInformation).findOne({
    paymentId: id,
    userId: user.id,
  });
  assert(receipt, 404);

  const { pdfStream, fileName } = await generateReceiptPdfStream(receipt);

  res.set('Cache-Control', `public, max-age=31536000`);
  res.attachment(fileName);
  pdfStream.pipe(res);
});

export const getMyCurrnetSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;

  const subscription = await getRepository(UserCurrentSubscription).findOne(
    {
      userId
    }
  );

  res.json(subscription);
});

export const provisionSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;
  const { plan, recurring, preferToUseCredit, method } = req.body;

  const payment = await provisionSubscriptionPurchase({
    userId,
    subscriptionType: plan,
    paymentMethod: method,
    recurring,
    preferToUseCredit,
  }, req);
  const result: any = {
    method,
    amount: payment.amount,
    paymentId: payment.id,
    subscriptionId: payment.subscription.id,
  };
  switch (method) {
    case PaymentMethod.Credit:
    case PaymentMethod.PayPal:
      // No need to do anything extra
      break;
    case PaymentMethod.Card: {
      const clientSecret = await createStripeClientSecretForCardPayment(payment);
      result.clientSecret = clientSecret;
      break;
    }
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
  }, { relations: ['subscription'] });

  assert(payment, 404);
  const { method } = payment;

  switch (method) {
    case PaymentMethod.Credit:
      // Immidiately commit the subscription purchase if it can be paied fully by credit
      await commitSubscription(payment);
      break;
    case PaymentMethod.Card:
      const { stripePaymentMethodId } = req.body;
      payment.stripePaymentMethodId = stripePaymentMethodId;
      const rawResponse = await chargeStripeForCardPayment(payment, true);
      payment.rawResponse = rawResponse;
      await commitSubscription(payment);
      break;
    case PaymentMethod.PayPal:
      payment.rawResponse = req.body;
      await commitSubscription(payment);
      break;
    default:
      assert(false, 500, `Unknown payment method ${method}`);
  }

  res.json();
});


export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId } } = req as any;
  const { type, preferToUseCredit } = req.body;
  const result = await calculateNewSubscriptionPaymentDetail(userId, type, preferToUseCredit);
  res.json(result);
});

