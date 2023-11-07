import { getConnection, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { getUtcNow } from './getUtcNow';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { getNewSubscriptionPaymentInfo } from './getNewSubscriptionPaymentInfo';
import { PaymentStatus } from '../types/PaymentStatus';
import { Payment } from '../entity/Payment';
import { PaymentMethod } from '../types/PaymentMethod';
import { assert } from './assert';
import { UserCurrentSubscription } from '../entity/views/UserCurrentSubscription';
import { getRequestGeoInfo } from './getIpGeoLocation';

export type ProvisionSubscriptionRequest = {
  userId: string;
  subscriptionType: SubscriptionType;
  paymentMethod: PaymentMethod;
  recurring: boolean;
};

async function getSubscriptionPeriod(q: QueryRunner, userId: string, newSubscriptionType: SubscriptionType): Promise<{ start: Date, end: Date }> {
  const aliveSubscription = await q.manager.getRepository(UserCurrentSubscription)
    .findOne({
      userId
    });

  const start = aliveSubscription ? moment(aliveSubscription.end).add(1, 'day').toDate() : getUtcNow();
  const unit = newSubscriptionType === SubscriptionType.UnlimitedYearly ? 'year' : 'month';
  const end = moment(start).add(1, unit).add(-1, 'day').toDate();
  return { start, end };
}

export async function provisionSubscriptionPurchase(request: ProvisionSubscriptionRequest, expressReq: any): Promise<Payment> {
  const { userId, subscriptionType, paymentMethod, recurring } = request;
  let payment: Payment = null;

  const tran = getConnection().createQueryRunner();
  try {
    tran.startTransaction();

    const { start, end } = await getSubscriptionPeriod(tran, userId, subscriptionType);

    const { totalCreditAmount, price } = await getNewSubscriptionPaymentInfo(userId, subscriptionType);

    const subscription = new Subscription();
    subscription.id = uuidv4();
    subscription.userId = userId;
    subscription.type = subscriptionType;
    subscription.start = start;
    subscription.end = end;
    subscription.recurring = paymentMethod !== PaymentMethod.Credit;
    subscription.useCredit = paymentMethod === PaymentMethod.Credit;
    subscription.status = SubscriptionStatus.Provisioning;
    await tran.manager.save(subscription);

    let creditTransaction: UserCreditTransaction = null;
    if (paymentMethod === PaymentMethod.Credit) {
      creditTransaction = new UserCreditTransaction();
      creditTransaction.userId = userId;
      creditTransaction.amount = -1 * price;
      creditTransaction.type = 'user-pay';
      await tran.manager.save(creditTransaction);
    }

    const paymentId = uuidv4();
    payment = new Payment();
    payment.id = paymentId;
    payment.userId = userId;
    payment.start = start;
    payment.end = end;
    payment.paidAt = null;
    payment.amount = paymentMethod === PaymentMethod.Credit ? 0 : price;
    payment.method = paymentMethod;
    payment.status = PaymentStatus.Pending;
    payment.auto = false;
    payment.geo = await getRequestGeoInfo(expressReq);
    payment.creditTransaction = creditTransaction;
    payment.subscription = subscription;

    await tran.manager.save(payment);

    tran.commitTransaction();
  } catch (err) {
    tran.rollbackTransaction();
    assert(false, 500, `Failed to provisoin subscription purchase: ${err.message}`);
  }

  return payment;
}




