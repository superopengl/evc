import { SubscriptionStatus } from './../types/SubscriptionStatus';
import { getManager, IsNull } from 'typeorm';
import { Subscription } from '../entity/Subscription';
import { User } from '../entity/User';
import { Role } from '../types/Role';
import { UserAliveSubscriptionSummary } from '../entity/views/UserAliveSubscriptionSummary';
import { EmailRequest } from '../types/EmailRequest';
import { EmailTemplateType } from '../types/EmailTemplateType';
import moment = require('moment');
import { enqueueEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getSubscriptionName } from './getSubscriptionName';

export async function terminateSubscriptionForUser(userId: string) {

  let target: UserAliveSubscriptionSummary;
  await getManager().transaction(async m => {

    target = await m.findOne(UserAliveSubscriptionSummary, { userId });
    if (target) {
      await m.update(Subscription,
        {
          id: target.currentSubscriptionId
        }, {
          status: SubscriptionStatus.Terminated,
          end: () => 'NOW()'
        });

      await m.update(User, {
        id: userId,
      }, {
        role: Role.Free
      });
    }
  });

  if(target) {
    const emailReq: EmailRequest = {
      to: target.email,
      template: EmailTemplateType.SubscriptionTerminated,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(target),
        subscriptionId: target.lastSubscriptionId,
        subscriptionType: getSubscriptionName(target.lastType),
        start: moment(target.start).format('D MMM YYYY'),
        end: moment().format('D MMM YYYY'),
      }
    };
    await enqueueEmail(emailReq);
  }

}


