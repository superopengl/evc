import Stripe from 'stripe';
import { getRepository, getManager } from 'typeorm';
import { Payment } from '../entity/Payment';
import { UserStripeCustomer } from '../entity/UserStripeCustomer';
import { assert } from '../utils/assert';
import { UserProfile } from '../entity/UserProfile';
import { User } from '../entity/User';


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

async function createStripeCustomer(userId: string, userProfile: UserProfile) {
  return await getStripe().customers.create({
    email: userProfile.email,
    name: `${userProfile.givenName} ${userProfile.surname}`.trim(),
    metadata: {
      evc_user_id: userId,
    }
  });
}

async function getUserStripeCustomer(userId) {
  const repo = getRepository(UserStripeCustomer);
  let customer = await repo.findOne({ userId });
  if (!customer) {
    const user = await getRepository(User).findOne(userId, { relations: ['profile'] });
    const stripeCustomer = await createStripeCustomer(userId, user.profile);
    customer = new UserStripeCustomer();
    customer.userId = userId;
    customer.customerId = stripeCustomer.id;
    await repo.insert(customer);
  }
  return customer;
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

async function createStripeSetupIntent(customerId) {
  const intent = await getStripe().setupIntents.create({
    customer: customerId,
  });
  return intent;
}

export async function createStripeSetupSetupIntent(payment: Payment): Promise<string> {
  const {id} = await getUserStripeCustomer(payment.userId);
  const intent = await createStripeSetupIntent(id);
  return intent.client_secret;
}

export async function previsionStripePayment(payment: Payment): Promise<string> {
  const {id} = await getUserStripeCustomer(payment.userId);
  const intent = await createStripePaymentIntent(payment.amount, id);
  return intent.client_secret;
}

export async function chargeStripe(payment: Payment, stripePaymentMethodId: string) {
  const customer = await getUserStripeCustomer(payment.userId);
  customer.paymentMethodId = stripePaymentMethodId;

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.ceil(payment.amount * 100),
    currency: 'usd',
    customer: customer.id,
    payment_method: stripePaymentMethodId,
    off_session: true,
    confirm: true
  });

  await getManager().save(customer);

  return paymentIntent;
}
