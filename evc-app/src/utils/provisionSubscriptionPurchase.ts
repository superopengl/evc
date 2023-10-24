import { getConnection, getManager, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { getUtcNow } from './getUtcNow';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { calculateNewSubscriptionPaymentDetail } from './calculateNewSubscriptionPaymentDetail';
import { PaymentStatus } from '../types/PaymentStatus';
import { Payment } from '../entity/Payment';
import { PaymentMethod } from '../types/PaymentMethod';
import { assert } from './assert';
import { UserCurrentSubscription } from '../entity/views/UserCurrentSubscription';

export type ProvisionSubscriptionRequest = {
  userId: string;
  subscriptionType: SubscriptionType;
  paymentMethod: PaymentMethod;
  recurring: boolean;
  preferToUseCredit: boolean;
};

async function getSubscriptionPeriod(q: QueryRunner, userId: string, newSubscriptionType: SubscriptionType): Promise<{ start: Date, end: Date }> {
  const aliveSubscription = await q.manager.getRepository(UserCurrentSubscription)
    .findOne({
      userId
    });

  const start = aliveSubscription ? moment(aliveSubscription.end).add(1, 'day').toDate() : getUtcNow();
  const unit = newSubscriptionType === SubscriptionType.UnlimitedYearly ? 'year' : 'month';
  const end = moment(start).add(1, unit).toDate();
  return { start, end };
}

export async function provisionSubscriptionPurchase(request: ProvisionSubscriptionRequest): Promise<Payment> {
  const { userId, subscriptionType, paymentMethod, recurring, preferToUseCredit } = request;
  let payment: Payment = null;

  const tran = getConnection().createQueryRunner();
  try {
    tran.startTransaction();

    const { start, end } = await getSubscriptionPeriod(tran, userId, subscriptionType);

    const detail = await calculateNewSubscriptionPaymentDetail(userId, subscriptionType, preferToUseCredit);
    const { totalCreditAmount, creditDeductAmount, additionalPay } = detail;

    if (paymentMethod === PaymentMethod.Credit) {
      assert(totalCreditAmount > 0 && totalCreditAmount >= creditDeductAmount && additionalPay === 0, 400, 'No enough credit');
    }

    const subscription = new Subscription();
    subscription.id = uuidv4();
    subscription.userId = userId;
    subscription.type = subscriptionType;
    subscription.start = start;
    subscription.end = end;
    subscription.recurring = recurring;
    subscription.preferToUseCredit = preferToUseCredit;
    subscription.status = SubscriptionStatus.Provisioning;
    await tran.manager.save(subscription);

    let creditTransaction: UserCreditTransaction = null;
    if (creditDeductAmount > 0) {
      creditTransaction = new UserCreditTransaction();
      creditTransaction.userId = userId;
      creditTransaction.amount = -1 * creditDeductAmount;
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
    payment.amount = additionalPay;
    payment.method = paymentMethod;
    payment.status = PaymentStatus.Pending;
    payment.auto = false;
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




