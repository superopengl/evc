
import { assert } from '../utils/assert';
import _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { enqueueEmail } from '../services/emailService';
import delay from 'delay';
import { getConfigValue } from '../services/configService';
import { EmailTemplateType } from '../types/EmailTemplateType';


export const saveContact = handlerWrapper(async (req, res) => {
  const { email, givenName, surname } = (req as any).user?.profile || {};
  const { name, contact, message } = req.body;

  const userName = `${givenName || ''} ${surname || ''}`.trim() || `Client ${email}`;
  const recipentName = email ? userName : name;
  const recipentContact = email || contact;
  assert(recipentName && recipentContact && message, 404, 'Invalid contact information');

  await enqueueEmail({
    template: EmailTemplateType.Contact,
    to: await getConfigValue('email.contact.recipient'),
    from: await getConfigValue('email.sender.noreply'),
    vars: {
      name: recipentName,
      contact: recipentContact,
      message
    }
  });

  await delay(1000);

  res.json();
});
