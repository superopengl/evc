import { Connection, getManager, getRepository, LessThan, getConnection } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { Subscription } from '../src/entity/Subscription';
import { SubscriptionStatus } from '../src/types/SubscriptionStatus';
import { UserCreditTransaction } from '../src/entity/UserCreditTransaction';
import { SubscriptionType } from '../src/types/SubscriptionType';
import { Payment } from '../src/entity/Payment';
import { User } from '../src/entity/User';
import { PaymentStatus } from '../src/types/PaymentStatus';
import * as moment from 'moment';
import { calculateNewSubscriptionPaymentDetail } from '../src/utils/calculateNewSubscriptionPaymentDetail';
import { Role } from '../src/types/Role';
import { start } from './jobStarter';

const JOB_NAME = 'daily-subscription';

async function expireSubscriptions() {
  const tran = getConnection().createQueryRunner();

  try {
    await tran.startTransaction();
    // Set subscriptions to be expired
    const { tableName, schema } = getRepository(Subscription).metadata;
    const result = await tran.query(
      `UPDATE "${schema}"."${tableName}" SET status = $1 WHERE status = $2 AND "end" < now() RETURNING "userId"`,
      [SubscriptionStatus.Expired, SubscriptionStatus.Alive]
    );
    const entities = result[0];

    if (entities?.length) {
      // Downgrade user's role to Free
      const userIds = entities.map(x => x.userId);
      const { tableName, schema } = getRepository(User).metadata;
      const result = await tran.query(
        `UPDATE "${schema}"."${tableName}" SET role = $1 WHERE "deletedAt" IS NULL AND role = $2 AND id = ANY($3) RETURNING id`,
        [Role.Free, Role.Member, userIds]
      );

      // TODO: send terminate subscription emails
    }

    tran.commitTransaction();
  } catch {
    tran.rollbackTransaction();
  }
}


async function sendAlertForNonRecurringExpiringSubscriptions() {
  const list: Subscription[] = await getRepository(Subscription)
    .createQueryBuilder()
    .where('status = :status', { status: SubscriptionStatus.Alive })
    .andWhere('recurring = FALSE')
    .andWhere('DATEADD(day, "alertDays", now()) >= "end"')
    .getMany();
  // TODO: send notificaiton emails to them
}

async function handlePayWithCard(subscription: Subscription) {
  // TODO: Call API to pay by card
  const rawRequest = {};
  const rawResponse = {};
  const status = PaymentStatus.Paid;
  return { rawRequest, rawResponse, status };
}

function extendSubscriptionEndDate(subscription: Subscription) {
  const { end, type } = subscription;
  let newEnd = end;
  switch (type) {
    case SubscriptionType.UnlimitedMontly:
      newEnd = moment(end).add(1, 'month').toDate();
      break;
    case SubscriptionType.UnlimitedYearly:
      newEnd = moment(end).add(12, 'month').toDate();
    default:
      throw new Error(`Unkonwn subscription type ${type}`);
  }

  subscription.end = newEnd;
}

async function renewRecurringSubscription(subscription: Subscription) {
  const { userId } = subscription;

  const { rawRequest, rawResponse, status } = await handlePayWithCard(subscription);
  await getManager().transaction(async m => {
    try {
      const { creditDeductAmount, additionalPay } = await calculateNewSubscriptionPaymentDetail(
        m,
        userId,
        subscription.type,
        true
      );

      let creditTransaction: UserCreditTransaction = null;
      if (creditDeductAmount) {
        creditTransaction = new UserCreditTransaction();
        creditTransaction.userId = userId;
        creditTransaction.amount = -1 * creditDeductAmount;
        creditTransaction.type = 'recurring';
        await m.save(creditTransaction);
      }
      const payment = new Payment();
      payment.subscription = subscription;
      payment.creditTransaction = creditTransaction;
      payment.amount = additionalPay;
      // payment.method = paymentMethod;
      payment.rawResponse = rawResponse;
      payment.status = status;
      payment.auto = true;
      await m.save(payment);

      extendSubscriptionEndDate(subscription);
      await m.save(subscription);

      // TODO: send successfully repaied email
    } catch (err) {
      // TODO: send failed repaying email
    }
  });
}

async function handleRecurringPayments() {
  const list: Subscription[] = await getRepository(Subscription)
    .createQueryBuilder()
    .where('status = :status', { status: SubscriptionStatus.Alive })
    .andWhere('recurring = TRUE')
    .andWhere('"end"::date = CURRENT_DATE')
    .leftJoinAndSelect('payments', 'payment')
    .execute();

  for (const subscription of list) {
    await renewRecurringSubscription(subscription);
  }
}

start(JOB_NAME, async () => {
  // console.log('Starting recurring payments');
  // await handleRecurringPayments();
  // console.log('Finished recurring payments');

  // console.log('Starting alerting expiring subscriptions');
  // await sendAlertForNonRecurringExpiringSubscriptions();
  // console.log('Finished alerting expiring subscriptions');

  console.log('Starting expiring subscriptions');
  await expireSubscriptions();
  console.log('Finished expiring subscriptions');
});