
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmail } from '../services/emailService';
import * as delay from 'delay';
import { getConfigValue } from '../services/configService';


export const saveContact = handlerWrapper(async (req, res) => {
  const {email, givenName, surname} = (req as any).user || {};
  const { name, contact, message } = req.body;

  const userName = `${givenName || ''} ${surname || ''}`.trim();
  const recipentName = userName || name;
  const recipentContact = email || contact;
  assert(recipentName && recipentContact && message, 404, `Invalid contact information`);

  await sendEmail({
    template: 'contact',
    to: await getConfigValue('email.contact.recipient'),
    from: email,
    vars: {
      name: recipentName,
      contact: recipentContact,
      message
    }
  }, true);

  await delay(1000);

  res.json();
});
