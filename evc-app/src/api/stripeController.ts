
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { createStripeCheckoutSession, parseStripeWebhookEvent } from '../services/stripeService';


export const webhookStripe = async (req, res) => {
  const event = await parseStripeWebhookEvent(req);

  switch (event.type) {
  case 'checkout.session.completed':
    break;
  default:
  }

  res.json({ received: true });
};

export const fetchCheckoutSession = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const session = await createStripeCheckoutSession();
  res.json(session.id);
});
