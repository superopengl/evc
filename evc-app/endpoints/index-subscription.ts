import { SubscriptionEndingNotificationEmailInformation } from './../src/entity/views/SubscriptionEndingNotificationEmailInformation';
import { getManager, getRepository, getConnection, In, Not, IsNull, Between } from 'typeorm';
import { Subscription } from '../src/entity/Subscription';
import { SubscriptionStatus } from '../src/types/SubscriptionStatus';
import { UserCreditTransaction } from '../src/entity/UserCreditTransaction';
import { SubscriptionType } from '../src/types/SubscriptionType';
import { Payment } from '../src/entity/Payment';
import { User } from '../src/entity/User';
import { PaymentStatus } from '../src/types/PaymentStatus';
import * as moment from 'moment';
import { Role } from '../src/types/Role';
import { start } from './jobStarter';
import { enqueueEmail, enqueueEmailInBulk } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { EmailRequest } from '../src/types/EmailRequest';
import { getEmailRecipientName } from '../src/utils/getEmailRecipientName';
import { PaymentMethod } from '../src/types/PaymentMethod';
import { SysLog } from '../src/entity/SysLog';
import { assert } from '../src/utils/assert';
import { chargeStripeForCardPayment } from '../src/services/stripeService';
import { getUtcNow } from '../src/utils/getUtcNow';
import { RevertableCreditTransaction } from '../src/entity/views/RevertableCreditTransaction';
import { getSubscriptionPrice } from '../src/utils/getSubscriptionPrice';
import { UserAliveSubscriptionSummary } from '../src/entity/views/UserAliveSubscriptionSummary';
import { notExistsQuery } from '../src/utils/existsQuery';
import { getSubscriptionName } from '../src/utils/getSubscriptionName';

const JOB_NAME = 'daily-subscription';

async function enqueueRecurringSucceededEmail(activeOne: UserAliveSubscriptionSummary, payment: Payment, price: number) {
  const emailReq: EmailRequest = {
    to: activeOne.email,
    template: EmailTemplateType.SubscriptionRecurringAutoPaySucceeded,
    shouldBcc: true,
    vars: {
      toWhom: getEmailRecipientName(activeOne),
      subscriptionId: activeOne.lastSubscriptionId,
      subscriptionType: getSubscriptionName(activeOne.lastType),
      start: moment(payment.start).format('D MMM YYYY'),
      end: moment(payment.end).format('D MMM YYYY'),
      paidAmount: price,
      creditDeduction: 0
    }
  };
  await enqueueEmail(emailReq);
}

async function enqueueRecurringFailedEmail(activeOne: UserAliveSubscriptionSummary, payment: Payment, price: number) {
  const emailReq: EmailRequest = {
    to: activeOne.email,
    template: EmailTemplateType.SubscriptionRecurringAutoPayFailed,
    shouldBcc: true,
    vars: {
      toWhom: getEmailRecipientName(activeOne),
      subscriptionId: activeOne.lastSubscriptionId,
      subscriptionType: getSubscriptionName(activeOne.lastType),
      start: moment(payment.start).format('D MMM YYYY'),
      end: moment(payment.end).format('D MMM YYYY'),
      paidAmount: price,
      creditDeduction: 0
    }
  };
  await enqueueEmail(emailReq);
}

async function expireSubscriptions() {
  await getManager().transaction(async m => {
    const list = await m.getRepository(UserAliveSubscriptionSummary)
      .createQueryBuilder()
      .where('"end" < CURRENT_DATE')
      .getMany();

    if (list.length) {
      // Set subscriptions to be expired
      const subscriptionIds = list.map(x => x.lastSubscriptionId);
      await m.update(Subscription, subscriptionIds, { status: SubscriptionStatus.Expired });

      // Set user's role to Free
      const userIds = list.map(x => x.userId);
      await m.update(User, userIds, { role: Role.Free })

      console.log(`Expired subscriptions ${subscriptionIds.join(', ')}`);
      console.log(`Set Free role to users ${userIds.join(', ')}`);

      // Compose email requests
      const emailRequests = list.map(x => {
        const emailRequest: EmailRequest = {
          to: x.email,
          template: EmailTemplateType.SubscriptionExpired,
          shouldBcc: true,
          vars: {
            toWhom: getEmailRecipientName(x),
            subscriptionId: x.lastSubscriptionId,
            subscriptionType: getSubscriptionName(x.lastType),
            start: moment(x.start).format('D MMM YYYY'),
            end: moment(x.end).format('D MMM YYYY'),
          }
        };
        return emailRequest;
      });

      // Enqueue email notifications
      await enqueueEmailInBulk(m, emailRequests);
    }
  });
}


async function sendEndingNotificationEmails() {
  await getManager().transaction(async m => {

    const list = await m.find(SubscriptionEndingNotificationEmailInformation, {
      sentAt: IsNull(),
      daysBeforeEnd: Between(1, 7)
    });

    // Compose email requests
    const emailRequests = list.map(x => {
      const emailRequest: EmailRequest = {
        to: x.email,
        template: x.recurring ? EmailTemplateType.SubscriptionAutoRenewing : EmailTemplateType.SubscriptionExpiring,
        shouldBcc: true,
        vars: {
          toWhom: getEmailRecipientName(x),
          subscriptionId: x.subscriptionId,
          subscriptionType: getSubscriptionName(x.type),
          start: moment(x.start).format('D MMM YYYY'),
          end: moment(x.end).format('D MMM YYYY'),
        }
      };
      return emailRequest;
    });

    // Enqueue email notifications
    await enqueueEmailInBulk(m, emailRequests);
  });
}

async function getPreviousPaymentInfo(subscription: Subscription) {
  // TODO: Call API to pay by card
  const lastPaidPayment = await getManager()
    .getRepository(Payment)
    .findOne({
      where: {
        subscriptionId: subscription.id,
        status: PaymentStatus.Paid,
        stripeCustomerId: Not(IsNull()),
        stripePaymentMethodId: Not(IsNull()),
      },
      order: {
        paidAt: 'DESC'
      }
    });
  const { stripeCustomerId, stripePaymentMethodId, geo } = lastPaidPayment || {};

  assert(stripeCustomerId, 500, `Cannot get previous stripeCustomerId for subscription ${subscription.id}`)
  assert(stripePaymentMethodId, 500, `Cannot get previous stripePaymentMethodId for subscription ${subscription.id}`)
  assert(geo, 500, `Cannot get previous geo for subscription ${subscription.id}`)

  return { stripeCustomerId, stripePaymentMethodId, geo };
}

async function renewRecurringSubscription(targetSubscription: UserAliveSubscriptionSummary) {
  const { lastSubscriptionId, userId, lastType: type, lastEnd } = targetSubscription;
  const subscription = await getRepository(Subscription).findOne({
    id: lastSubscriptionId,
    recurring: true,
  });

  const tran = getConnection().createQueryRunner();
  const price = getSubscriptionPrice(type);

  const { stripeCustomerId, stripePaymentMethodId, geo } = await getPreviousPaymentInfo(subscription);

  const startDate = moment(lastEnd).add(1, 'day').toDate();
  const endDate = moment(startDate).add(1, type === SubscriptionType.UnlimitedYearly ? 'year' : 'month').add(-1, 'day').toDate();
  const payment = new Payment();
  payment.subscription = subscription;
  payment.creditTransaction = null;
  payment.userId = userId;
  payment.start = startDate;
  payment.end = endDate
  payment.amount = price;
  payment.method = PaymentMethod.Card;
  payment.status = PaymentStatus.Pending;
  payment.stripeCustomerId = stripeCustomerId;
  payment.stripePaymentMethodId = stripePaymentMethodId;
  payment.auto = true;
  payment.geo = geo;

  const rawResponse = await chargeStripeForCardPayment(payment, false);
  assert(rawResponse.status === 'succeeded', 500, `Failed to auto charge stripe for subscription ${subscription.id}`);
  payment.rawResponse = rawResponse;
  payment.status = PaymentStatus.Paid;
  payment.paidAt = getUtcNow();

  subscription.status = SubscriptionStatus.Alive;
  subscription.end = endDate;

  try {
    await tran.startTransaction();

    await tran.manager.save(payment);
    await tran.manager.save(subscription);
    await tran.manager.update(User, subscription.userId, { role: Role.Member });

    await tran.commitTransaction();

    console.log(`Renewed subscription ${lastSubscriptionId} for user ${userId} at $${price} from ${startDate} to ${endDate}`);
    await enqueueRecurringSucceededEmail(targetSubscription, payment, price);
  } catch (err) {
    await tran.rollbackTransaction();
    await enqueueRecurringFailedEmail(targetSubscription, payment, price);
  }
}

async function handleRecurringPayments() {
  const list = await getRepository(UserAliveSubscriptionSummary)
    .createQueryBuilder()
    .where('"lastRecurring" = TRUE')
    .andWhere('"end" <= CURRENT_DATE')
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

async function timeoutProvisioningSubscriptions() {
  const list = await getRepository(RevertableCreditTransaction).find({});
  if (!list.length) {
    return;
  }

  const creditTransactions = list.map(x => {
    const entity = new UserCreditTransaction();
    entity.userId = x.userId;
    entity.revertedCreditTransactionId = x.creditTransactionId;
    entity.amount = -1 * x.amount;
    entity.type = 'revert';
    return entity;
  });

  const subscriptionIds = list.map(x => x.subscriptionId);
  await getManager().transaction(async m => {
    await m.save(creditTransactions);
    m.update(Subscription, { id: In(subscriptionIds) }, { status: SubscriptionStatus.Timeout });
  });

  console.log(`Timed out provisioning subscriptions ${subscriptionIds.join(', ')}`);
}

async function revokeUnpaidUsersRole() {
  await getManager().transaction(async m => {
    const users = await m
      .createQueryBuilder()
      .from(User, 'u')
      .where(`role = '${Role.Member}'`)
      .andWhere(`"deletedAt" IS NULL`)
      .andWhere(
        notExistsQuery(
          getRepository(UserAliveSubscriptionSummary)
            .createQueryBuilder('s')
            .where(`u.id = s."userId"`)
        )
      )
      .select('id')
      .execute();

    if (users.length) {
      const userIds = users.map(u => u.id);
      await m.update(User, userIds, { role: Role.Free });

      console.log(`Revoked membership from users ${userIds.join(', ')}`);
    }
  })
}

start(JOB_NAME, async () => {
  console.log('Starting recurring payments');
  await handleRecurringPayments();
  console.log('Finished recurring payments');

  console.log('Starting sending notification emails for renewing/expiring subscriptions');
  await sendEndingNotificationEmails();
  console.log('Finished sending notification emails for renewing/expiring subscriptions');

  console.log('Starting expiring subscriptions');
  await expireSubscriptions();
  console.log('Finished expiring subscriptions');

  console.log('Starting revoking unpaid users');
  await revokeUnpaidUsersRole();
  console.log('Finished revoking unpaid users');

  console.log('Starting reverting timed out subscriptions');
  await timeoutProvisioningSubscriptions();
  console.log('Finished reverting timed out subscriptions');
}, { daemon: false });