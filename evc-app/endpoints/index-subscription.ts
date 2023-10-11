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
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { UserOngoingSubscriptionInformation } from '../src/entity/views/UserOngoingSubscriptionInformation';
import { EmailRequest } from '../src/types/EmailRequest';
import { getEmailRecipientName } from '../src/utils/getEmailRecipientName';

const JOB_NAME = 'daily-subscription';

async function enqueueEmailTasks(template: EmailTemplateType, list: UserOngoingSubscriptionInformation[]) {
  for (const item of list) {
    const emailReq: EmailRequest = {
      to: item.email,
      template: template,
      shouldBcc: true,
      vars: {
        name: getEmailRecipientName(item),
        subscriptionId: item.subscriptionId,
        subscriptionType: item.subscriptionType,
        start: item.start,
        end: item.end,
      }
    };
    await enqueueEmail(emailReq);
  }
}

async function expireSubscriptions() {
  const tran = getConnection().createQueryRunner();

  try {
    await tran.startTransaction();
    const list = await getRepository(UserOngoingSubscriptionInformation)
      .createQueryBuilder()
      .where('end < now()')
      .getMany();

    if (list.length) {
      // Set subscriptions to be expired
      const subscriptionIds = list.map(x => x.subscriptionId);
      await getRepository(Subscription).update(subscriptionIds, { status: SubscriptionStatus.Expired });

      // Set user's role to Free
      const userIds = list.map(x => x.userId);
      await getRepository(User).update(userIds, { role: Role.Free })
    }

    tran.commitTransaction();

    enqueueEmailTasks(EmailTemplateType.SubscriptionExpired, list);
  } catch {
    tran.rollbackTransaction();
  }
}


async function sendAlertForNonRecurringExpiringSubscriptions() {
  const list = await getRepository(UserOngoingSubscriptionInformation)
    .createQueryBuilder()
    .where('recurring = FALSE')
    .andWhere('DATEADD(day, "alertDays", now()) >= "end"')
    .getMany();

  enqueueEmailTasks(EmailTemplateType.SubscriptionExpiring, list);
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
  console.log('Starting recurring payments');
  await handleRecurringPayments();
  console.log('Finished recurring payments');

  console.log('Starting alerting expiring subscriptions');
  await sendAlertForNonRecurringExpiringSubscriptions();
  console.log('Finished alerting expiring subscriptions');

  console.log('Starting expiring subscriptions');
  await expireSubscriptions();
  console.log('Finished expiring subscriptions');
});