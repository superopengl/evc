import { getManager, getRepository } from 'typeorm';
import { assert } from './assert';
import { Payment } from '../entity/Payment';
import { PaymentStatus } from '../types/PaymentStatus';


export async function rollbackSubscriptionPurchase(
  paymentId: string,
  rawRequest: any,
  rawResponse: any
) {
  await getManager().transaction(async (m) => {
    const payment = await getRepository(Payment).findOne({
      where: {
        id: paymentId,
        status: PaymentStatus.Pending
      },
      relations: ['subscription', 'balanceTransaction']
    });
    assert(payment, 404, 'Cannot rollback subscriptino due to invalid payment status');

    payment.rawRequest = rawRequest;
    payment.rawResponse = rawResponse;
    payment.status = PaymentStatus.Failed;

    const balanceTransaction = payment.balanceTransaction;
    if (balanceTransaction && balanceTransaction.amount < 0) {
      balanceTransaction.amountBeforeRollback = balanceTransaction.amount;
      balanceTransaction.amount = 0;
    }

    await m.save([payment, balanceTransaction]);
  });
}
