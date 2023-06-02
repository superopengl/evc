import Stripe from 'stripe';
import { assert } from '../utils/assert';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

export async function createSession() {

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'setup',
    customer: 'cus_FOsk5sbh3ZQpAU',
    success_url: `${process.env.EVC_WEB_DOMAIN_NAME}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.EVC_WEB_DOMAIN_NAME}/cancel`,
  });

  return session;
};

export async function retrieveCheckoutSession() {
  const checkoutSessionId = '';
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ['customer', 'setup_intent']
  });
  const setupIntentId = session.id;
}


export function getStripe() {
  return stripe;
}

export async function parseStripeWebhookEvent(req) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SIGN_SECRET;
  const { body } = req;
  try {
    const event = endpointSecret ? await stripe.webhooks.constructEvent(body, sig, endpointSecret) : JSON.parse(body);
    return event;
  }
  catch (err) {
    assert(false, 400, `Webhook Error: ${err.message}`);
  }
}