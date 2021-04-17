import { getConnection, getManager } from 'typeorm';
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

export type ProvisionSubscriptionRequest = {
  userId: string;
  subscriptionType: SubscriptionType;
  paymentMethod: PaymentMethod;
  recurring: boolean;
  preferToUseCredit: boolean;
  alertDays: number;
};

export async function provisionSubscriptionPurchase(request: ProvisionSubscriptionRequest): Promise<Payment> {
  const { userId, subscriptionType, paymentMethod, recurring, preferToUseCredit, alertDays } = request;
  const now = getUtcNow();

  const months = subscriptionType === SubscriptionType.UnlimitedYearly ? 12 : 1;
  const end = moment(now).add(months, 'month').toDate();
  let payment: Payment = null;

  const tran = getConnection().createQueryRunner();
  try {
    tran.startTransaction();

    const detail = await calculateNewSubscriptionPaymentDetail(userId, subscriptionType, preferToUseCredit);
    const { totalCreditAmount, creditDeductAmount, additionalPay } = detail;

    if(paymentMethod === PaymentMethod.Credit) {
      assert(totalCreditAmount > 0 && totalCreditAmount >= creditDeductAmount && additionalPay === 0, 400, 'No enough credit');
    }

    const subscriptionId = uuidv4();
    const subscription = new Subscription();
    subscription.id = subscriptionId;
    subscription.userId = userId;
    subscription.type = subscriptionType;
    subscription.recurring = recurring;
    subscription.start = now;
    subscription.end = end;
    subscription.preferToUseCredit = preferToUseCredit;
    subscription.alertDays = alertDays;
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
    payment.start = now;
    payment.end = end;
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




