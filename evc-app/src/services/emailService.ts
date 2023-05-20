import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as Email from 'email-templates';
import * as path from 'path';
import { logError } from '../utils/logger';

let emailerInstance = null;
const sender = 'EasyValueCheck <noreply@easyvaluecheck.com>';

function getEmailer() {
  if (!emailerInstance) {
    awsConfig();
    const transport = nodemailer.createTransport({
      SES: new aws.SES({ apiVersion: '2010-12-01' })
    });

    emailerInstance = new Email({
      preview: false,
      send: true,
      transport,
    });
  }
  return emailerInstance;
}

export async function sendEmail(req: EmailRequest, throws = false) {
  const { to, template, vars, shouldBcc, attachments, from } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  const locals = {
    website: process.env.EVC_API_DOMAIN_NAME,
    ...vars
  };

  try {
    await getEmailer().send({
      template: path.join(__dirname, 'emailTemplates', template),
      locals,
      message: {
        from: from || sender,
        bcc: shouldBcc ? sender : undefined,
        to,
        attachments
      }
    });
    console.log('Sent out email to', to);
  } catch (err) {
    logError(err, req, null, 'Sending email error', to, template, vars);
    if (throws) {
      throw err;
    }
  }
}



export class EmailRequest {
  to: string;
  from?: string;
  template: string;
  vars: object;
  attachments?: { filename: string, path: string }[];
  shouldBcc?: boolean = false;
}
