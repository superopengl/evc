import Stripe from 'stripe';
import { getRepository, getManager } from 'typeorm';
import { Payment } from '../entity/Payment';
import { assert } from '../utils/assert';
import { UserProfile } from '../entity/UserProfile';
import { User } from '../entity/User';
import { PaymentMethod } from '../types/PaymentMethod';


const isProd = process.env.NODE_ENV === 'prod';
let stripe: Stripe = null;
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
  }
  return stripe;
}

export async function createStripeCheckoutSession() {

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'setup',
    customer: 'cus_FOsk5sbh3ZQpAU',
    success_url: `${process.env.EVC_WEB_DOMAIN_NAME}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.EVC_WEB_DOMAIN_NAME}/cancel`,
  });

  return session;
}


async function createStripeCustomer(userId: string, userProfile: UserProfile) {
  return await getStripe().customers.create({
    email: userProfile.email,
    name: `${userProfile.givenName} ${userProfile.surname}`.trim(),
    metadata: {
      evc_user_id: userId,
      evc_payment_id: null,
    }
  });
}

async function getUserStripeCustomerId(payment: Payment) {
  if (!payment.stripeCustomerId) {
    const user = await getRepository(User).findOne(payment.userId, { relations: ['profile'] });
    const stripeCustomer = await createStripeCustomer(payment.userId, user.profile);
    payment.stripeCustomerId = stripeCustomer.id;
    await getManager().save(payment);
  }
  return payment.stripeCustomerId;
}

// async function createStripePaymentIntent(amount, customerId) {
//   if (amount <= 0) {
//     throw new Error('The stripe payment amount must be a positive number');
//   }
//   const intent = await getStripe().paymentIntents.create({
//     amount: Math.ceil(amount * 100),
//     currency: 'usd',
//     customer: customerId,
//   });
//   return intent;
// }

export async function createStripeClientSecretForCardPayment(payment: Payment): Promise<string> {
  const stripeCustomerId = await getUserStripeCustomerId(payment);
  const intent = await getStripe().setupIntents.create({
    customer: stripeCustomerId,
  });
  return intent.client_secret;
}

// async function previsionStripePayment(payment: Payment): Promise<string> {
//   const stripeCustomerId = await getUserStripeCustomerId(payment);
//   const intent = await createStripePaymentIntent(payment.amount, stripeCustomerId);
//   return intent.client_secret;
// }

const DUMMY_STRIPE_RESPONSE = {
  status: 'succeeded',
  dummyStripeResponse: true
};

export async function chargeStripeForCardPayment(payment: Payment, onSessionPayment: boolean) {
  const { amount, method, stripeCustomerId, stripePaymentMethodId } = payment;

  assert(method === PaymentMethod.Card, 400, 'Payment method not match');
  assert(stripeCustomerId, 400, 'Stripe customer ID is missing');
  assert(stripePaymentMethodId, 400, 'Stripe payment method ID is missing');

  const paymentIntent = amount ? await getStripe().paymentIntents.create({
    amount: Math.ceil(amount * 100),
    currency: 'usd',
    customer: stripeCustomerId,
    payment_method: stripePaymentMethodId,
    off_session: !onSessionPayment,
    payment_method_types: ['card'],
    confirm: true
  }) : DUMMY_STRIPE_RESPONSE;

  return paymentIntent;
}

export async function chargeStripeForAlipay(payment: Payment): Promise<string> {
  const { amountCny, method } = payment;

  assert(method === PaymentMethod.AliPay, 400, 'Payment method not match');
  assert(amountCny, 400, 'amountCny must be positive number');

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.ceil(amountCny * 100),
    currency: 'cny',
    payment_method_types: ['alipay'],
  });

  payment.stripeAlipayPaymentIntentId = paymentIntent.id;
  await getManager().save(payment);

  return paymentIntent.client_secret;
}
