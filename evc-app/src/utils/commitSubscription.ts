import { getManager, getRepository } from 'typeorm';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { PaymentMethod } from '../types/PaymentMethod';
import { assert } from './assert';
import { Payment } from '../entity/Payment';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';
import { PaymentStatus } from '../types/PaymentStatus';
import { getSubscriptionPrice } from './getSubscriptionPrice';
import { now } from 'moment';
import { getUtcNow } from './getUtcNow';
import { User } from '../entity/User';
import { handleReferralKickbackWhenPaid } from '../services/referralService';
import { Role } from '../types/Role';


export async function commitSubscription(
  paymentId: string,
  rawResponse: any,
) {
  await getManager().transaction(async (m) => {
    const payment = await getRepository(Payment).findOne({
      where: {
        id: paymentId,
        status: PaymentStatus.Pending
      },
      relations: ['subscription']
    });
    assert(payment, 404, 'Cannot commit subscriptino due to invalid payment status');

    payment.rawResponse = rawResponse;
    payment.status = PaymentStatus.Paid;

    const subscription = payment.subscription;
    subscription.status = SubscriptionStatus.Alive;
    const { userId } = subscription;

    await m.save(payment);

    await m.getRepository(Subscription).update({
      userId,
      status: SubscriptionStatus.Alive
    }, {
      end: getUtcNow(),
      status: SubscriptionStatus.Terminated
    });

    await m.save(subscription);

    await m.getRepository(User).update({
      id: userId
    }, {
      role: Role.Member
    });

    if (payment.method !== PaymentMethod.Credit) {
      await handleReferralKickbackWhenPaid(m, userId);
    }
  });
}

