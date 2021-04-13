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
import { PaymentMethod } from '../src/types/PaymentMethod';
import { logError } from '../src/utils/logger';
import { SysLog } from '../src/entity/SysLog';

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

async function enqueueRecurringSucceededEmail(info: UserOngoingSubscriptionInformation, subscription: Subscription) {
  const emailReq: EmailRequest = {
    to: info.email,
    template: EmailTemplateType.SubscriptionRecurringAutoPaySucceeded,
    shouldBcc: true,
    vars: {
      name: getEmailRecipientName(info),
      subscriptionId: info.subscriptionId,
      subscriptionType: info.subscriptionType,
      start: subscription.start,
      end: subscription.end,
    }
  };
  await enqueueEmail(emailReq);
}

async function enqueueRecurringFailedEmail(info: UserOngoingSubscriptionInformation, subscription: Subscription) {
  const emailReq: EmailRequest = {
    to: info.email,
    template: EmailTemplateType.SubscriptionRecurringAutoPayFailed,
    shouldBcc: true,
    vars: {
      name: getEmailRecipientName(info),
      subscriptionId: info.subscriptionId,
      subscriptionType: info.subscriptionType,
      start: subscription.start,
      end: subscription.end,
    }
  };
  await enqueueEmail(emailReq);
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

async function renewRecurringSubscription(info: UserOngoingSubscriptionInformation) {
  const { subscriptionId, userId } = info;
  const subscription = await getRepository(Subscription).findOne(subscriptionId, { relations: ['payments'] })

  const { rawRequest, rawResponse, status } = await handlePayWithCard(subscription);
  const tran = getConnection().createQueryRunner();

  try {
    await tran.startTransaction();
    const { creditDeductAmount, additionalPay } = await calculateNewSubscriptionPaymentDetail(
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
      await getManager().save(creditTransaction);
    }

    const payment = new Payment();
    payment.subscription = subscription;
    payment.creditTransaction = creditTransaction;
    payment.amount = additionalPay;
    payment.method = PaymentMethod.Card;
    payment.rawResponse = rawResponse;
    payment.status = status;
    payment.auto = true;
    await getManager().save(payment);

    extendSubscriptionEndDate(subscription);
    await getManager().save(subscription);

    await tran.commitTransaction();
    await enqueueRecurringSucceededEmail(info, subscription);
  } catch (err) {
    await tran.rollbackTransaction();
    await enqueueRecurringFailedEmail(info, subscription);
  }
}

async function handleRecurringPayments() {
  const list = await getRepository(UserOngoingSubscriptionInformation)
    .createQueryBuilder()
    .where('recurring = TRUE')
    .andWhere('"end"::date = CURRENT_DATE')
    // .leftJoinAndSelect('payments', 'payment')
    .getMany();

  for (const item of list) {
    try {
      await renewRecurringSubscription(item);
    } catch (err) {
      const sysLog = new SysLog();
      sysLog.level = 'autopay_falied';
      sysLog.message = 'Recurring auto pay failed';
      sysLog.req = item;
      await getRepository(SysLog).insert(sysLog);
    }
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