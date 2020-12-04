import Stripe from 'stripe';
import { getRepository } from 'typeorm';
import { Payment } from '../entity/Payment';
import { UserStripeCustomer } from '../entity/UserStripeCustomer';
import { assert } from '../utils/assert';


let stripe = null;
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
};

export async function parseStripeWebhookEvent(req) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SIGN_SECRET;
  const { body } = req;
  try {
    const event = endpointSecret ? await getStripe().webhooks.constructEvent(body, sig, endpointSecret) : JSON.parse(body);
    return event;
  }
  catch (err) {
    assert(false, 400, `Webhook Error: ${err.message}`);
  }
}

async function createStripeCustomer() {
  return await getStripe().customers.create();
}

async function getUserStripeCustomerId(userId) {
  const repo = getRepository(UserStripeCustomer);
  let customer = await repo.findOne({ userId });
  if (!customer) {
    const stripeCustomer = await createStripeCustomer();
    customer = new UserStripeCustomer();
    customer.userId = userId;
    customer.customerId = stripeCustomer.id;
    await repo.insert(customer);
  }
  return customer.customerId;
}

async function createStripePaymentIntent(amount, customerId) {
  if (amount <= 0) {
    throw new Error('The stripe payment amount must be a positive number');
  }
  const intent = await getStripe().paymentIntents.create({
    amount: Math.ceil(amount * 100),
    currency: 'usd',
    customer: customerId,
  });
  return intent;
}

export async function previsionStripePayment(payment: Payment): Promise<string> {
  const stripeCustomerId = await getUserStripeCustomerId(payment.userId);
  const intent = await createStripePaymentIntent(payment.amount, stripeCustomerId);
  return intent.client_secret;
}
