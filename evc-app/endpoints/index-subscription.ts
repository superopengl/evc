import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager, getRepository, LessThan, Not } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { getReferralGlobalPolicy } from '../src/api/referralPolicyController';
import { Subscription } from '../src/entity/Subscription';
import { SubscriptionStatus } from '../src/types/SubscriptionStatus';
import { getUtcNow } from '../src/utils/getUtcNow';
import { UserBalanceTransaction } from '../src/entity/UserBalanceLog';
import { getUnitPricing } from '../src/utils/getUnitPricing';
import { SubscriptionType } from '../src/types/SubscriptionType';
import { getSubscriptionPrice } from '../src/utils/getSubscriptionPrice';
import { Payment } from '../src/entity/Payment';
import { PaymentMethod } from '../src/types/PaymentMethod';
import { PaymentStatus } from '../src/types/PaymentStatus';
import * as moment from 'moment';

async function expireSubscriptions() {
  await getManager()
    .createQueryBuilder()
    .update(Subscription)
    .set({ status: SubscriptionStatus.Expired })
    .where(`status = :status`, { status: SubscriptionStatus.Alive })
    .andWhere(`"end" < timezone('UTC', now())`)
    .execute();
}

async function sendAlertForExpiringSubscriptions() {
  const list = await getRepository(Subscription)
    .createQueryBuilder()
    .where(`status = :status`, { status: SubscriptionStatus.Alive })
    .andWhere(`DATEADD(day, "alertDays", timezone('UTC', now())) >= "end"`)
    .execute();
  // TODO: send notificaiton emails to them
}

async function getUserBalance(userId) {
  const result = await getRepository(UserBalanceTransaction)
    .createQueryBuilder()
    .where({ userId })
    .select('SUM(amount) as total')
    .execute();

  return result?.total || 0;
}

function calculateAmountToPay(balanceAmount, price) {
  let balanceDeductAmount = 0;
  let additionalPay = price;
  let paymentMethod: PaymentMethod;
  if (balanceAmount >= price) {
    // Full balance pay. Pay 0
    balanceDeductAmount = price;
    additionalPay = 0;
    paymentMethod = PaymentMethod.Balance;
  } else if (balanceAmount > 0) {
    // Mix pay
    balanceDeductAmount = balanceAmount;
    additionalPay = price - balanceAmount;
    paymentMethod = PaymentMethod.BalanceCardMix;
  } else {
    // Full pay
    balanceDeductAmount = 0;
    additionalPay = price;
    paymentMethod = PaymentMethod.Card;
  }

  return { balanceDeductAmount, additionalPay, paymentMethod };
}

async function handlePayWithCard(subscription: Subscription) {
  // TODO: Call API to pay by card
  const rawRequest = {};
  const rawResponse = {};
  const status = PaymentStatus.OK;
  return { rawRequest, rawResponse, status };
}

function extendSubscriptionEndDate(subscription: Subscription) {
  const { end, type } = subscription;
  let newEnd = end;
  switch (type) {
    case SubscriptionType.SelectedMonthly:
    case SubscriptionType.UnlimitedMontly:
      newEnd = moment(end).add(1, 'month').toDate();
      break;
    case SubscriptionType.UnlimitedQuarterly:
      newEnd = moment(end).add(3, 'month').toDate();
    default:
      throw new Error(`Unkonwn subscription type ${type}`);
  }

  subscription.end = newEnd;
}

async function renewRecurringSubscription(subscription: Subscription) {
  const { userId } = subscription;
  const balanceAmount = await getUserBalance(userId);
  const price = getSubscriptionPrice(subscription);
  const { balanceDeductAmount, additionalPay, paymentMethod } = calculateAmountToPay(balanceAmount, price);

  const { rawRequest, rawResponse, status } = await handlePayWithCard(subscription);
  await getManager().transaction(async m => {
    let balanceTransaction: UserBalanceTransaction = null;
    if (balanceDeductAmount) {
      balanceTransaction = new UserBalanceTransaction();
      balanceTransaction.userId = userId;
      balanceTransaction.amount = -1 * balanceDeductAmount;
      await m.save(balanceTransaction);
    }
    const payment = new Payment();
    payment.subscription = subscription;
    payment.balanceTransaction = balanceTransaction;
    payment.amount = additionalPay;
    payment.method = paymentMethod;
    payment.rawRequest = rawRequest;
    payment.rawResponse = rawResponse;
    payment.status = status;
    payment.auto = true;
    payment.subscription = subscription;
    await m.save(payment);

    extendSubscriptionEndDate(subscription);
    await m.save(subscription);
  })
}

async function handleRecurringPayments() {
  const list: Subscription[] = await getRepository(Subscription)
    .createQueryBuilder()
    .where(`status = :status`, { status: SubscriptionStatus.Alive })
    .andWhere(`recurring = TRUE`)
    .andWhere(`DATEADD(day, "alertDays", timezone('UTC', now())) >= "end"`)
    .leftJoinAndSelect('payments', 'payment')
    .execute();

  for (const subscription of list) {
    await renewRecurringSubscription(subscription);
  }
}

async function scanSubscriptions() {
  await handleRecurringPayments();
  await sendAlertForExpiringSubscriptions();
  await expireSubscriptions();
}

export const start = async () => {
  let connection: Connection = null;
  try {
    connection = await connectDatabase();
    await scanSubscriptions();
    console.log('Task', 'subscription', 'done');
  } catch (e) {
    console.error('Task', 'subscription', 'failed', errorToJson(e));
  } finally {
    connection?.close();
  }
};
