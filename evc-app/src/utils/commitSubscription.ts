import { getManager, getRepository } from 'typeorm';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { PaymentMethod } from '../types/PaymentMethod';
import { assert } from './assert';
import { Payment } from '../entity/Payment';
import { PaymentStatus } from '../types/PaymentStatus';
import { getUtcNow } from './getUtcNow';
import { User } from '../entity/User';
import { handleReferralCommissionWhenPaid } from '../services/referralService';
import { Role } from '../types/Role';


export async function commitSubscription(payment: Payment) {
  await getManager().transaction(async (m) => {
    payment.status = PaymentStatus.Paid;
    payment.paidAt = getUtcNow();

    const subscription = payment.subscription;
    subscription.status = SubscriptionStatus.Alive;
    const { userId } = subscription;

    await m.save(payment);

    await m.save(subscription);

    await m.getRepository(User).update({
      id: userId,
      role: Role.Free
    }, {
      role: Role.Member
    });

    if (payment.method !== PaymentMethod.Credit) {
      await handleReferralCommissionWhenPaid(m, userId);
    }
  });
}

