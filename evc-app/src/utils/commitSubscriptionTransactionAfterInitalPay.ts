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


export async function commitSubscriptionTransactionAfterInitalPay(
  subscriptionId: string,
  userId: string,
  paidAmount: number,
  paymentMethod: PaymentMethod,
  rawRequest: any,
  rawResponse: any,
  auto: boolean,
  idAddress: string
) {
  assert(paidAmount !== 0 || paymentMethod === PaymentMethod.Balance, 400, 'paidAmount and payment method do not match');

  const subscription = await getRepository(Subscription).findOne({
    id: subscriptionId,
    userId,
    status: SubscriptionStatus.Provisioning
  });
  assert(subscription, 404, 'Subscription not found or is not of provisioning state');
  const { type, symbols } = subscription;
  const fullPrice = getSubscriptionPrice(type, symbols);

  await getManager().transaction(async (m) => {
    let balanceTransaction: UserBalanceTransaction = null;
    const balanceDeduction = fullPrice - paidAmount;
    if (balanceDeduction > 0) {
      balanceTransaction = new UserBalanceTransaction();
      balanceTransaction.userId = userId;
      balanceTransaction.amount = -1 * balanceDeduction;
      // await m.save(balanceTransaction);
    }

    const payment = new Payment();
    payment.amount = paidAmount;
    payment.method = paymentMethod;
    payment.rawRequest = rawRequest;
    payment.rawResponse = rawResponse;
    payment.status = PaymentStatus.OK;
    payment.ipAddress = idAddress;
    payment.auto = auto;
    payment.balanceTransaction = balanceTransaction;
    payment.subscription = subscription;
    await m.save(payment);

    await m.getRepository(Subscription).update({
      userId,
      status: SubscriptionStatus.Alive
    }, {
      end: getUtcNow(),
      status: SubscriptionStatus.Terminated
    });

    subscription.status = SubscriptionStatus.Alive;
    await m.save(subscription);
  });
}
