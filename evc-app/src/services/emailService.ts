import aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import { logError } from '../utils/logger';
import { EmailRequest } from '../types/EmailRequest';
import { Locale } from '../types/Locale';
import { getRepository, EntityManager, getManager } from 'typeorm';
import { EmailTemplate } from '../entity/EmailTemplate';
import handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import { getConfigValue } from './configService';
import { EmailLog } from '../entity/EmailLog';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { User } from '../entity/User';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { EmailSentOutTask } from '../entity/EmailSentOutTask';
import { v4 as uuidv4 } from 'uuid';

let emailTransporter = null;

function getEmailer() {
  if (!emailTransporter) {
    awsConfig();
    emailTransporter = nodemailer.createTransport({
      SES: new aws.SES({ apiVersion: '2010-12-01' })
    });
  }
  return emailTransporter;
}

async function getEmailTemplate(templateName: string, locale: Locale): Promise<EmailTemplate> {
  if (!locale) {
    locale = Locale.Engish;
  }

  const template = await getRepository(EmailTemplate).findOne({ key: templateName, locale });
  assert(template, 500, `Cannot find email template for key ${templateName} and locale ${locale}`);

  return template;
}

async function getEmailSignature(locale: Locale): Promise<string> {
  if (!locale) {
    locale = Locale.Engish;
  }

  const { body } = await getRepository(EmailTemplate).findOne({ key: 'signature', locale });
  assert(body, 500, `Cannot find email signature for locale ${locale}`);

  return body;
}

async function composeEmailOption(req: EmailRequest) {
  const { subject, text, html } = await compileEmailBody(req);

  return {
    from: req.from || await getConfigValue('email.sender.noreply'),
    to: req.to,
    bcc: req.shouldBcc ? await getConfigValue('email.sender.bcc') : undefined,
    subject: subject,
    text: text,
    html: html,
  };
}

async function compileEmailBody(req: EmailRequest) {
  const { template, vars, locale } = req;
  const { subject, body } = await getEmailTemplate(template, locale);
  const signature = await getEmailSignature(locale);

  const allVars = {
    website: process.env.EVC_API_DOMAIN_NAME,
    ...vars
  };

  const compiledBody = handlebars.compile(body);
  const html = compiledBody(allVars) + signature;

  return { subject, html, text: htmlToText(html) };
}

export async function sendEmail(req: EmailRequest) {
  const { to, template, vars } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  let log: EmailLog = null;
  const emailLogRepo = getRepository(EmailLog);
  try {
    const option = await composeEmailOption(req);
    log = new EmailLog();
    log.email = option.to;
    log.templateKey = req.template;
    log.vars = req.vars;

    await getEmailer().sendMail(option);

    await emailLogRepo.insert(log);
    console.log('Sent out email to'.green, to);
  } catch (err) {
    console.log('Sent out email error'.red, err.message);
    if (log) {
      log.error = err;
      await emailLogRepo.insert(log);
    } else {
      logError(err, req, null, 'Sending email error', to, template, vars);
    }
    throw err;
  }
}

export async function enqueueEmail(req: EmailRequest) {
  await enqueueEmailInBulk(getManager(), [req]);
}

export async function enqueueEmailInBulk(m: EntityManager, emailRequests: EmailRequest[]) {
  const defaultFrom = await getConfigValue('email.sender.noreply');
  const entities: EmailSentOutTask[] = [];
  for (const req of emailRequests) {
    const { to, template } = req;
    assert(to, 400, 'Email recipient is not specified');
    assert(template, 400, 'Email template is not specified');

    const emailTask = new EmailSentOutTask();
    emailTask.from = req.from || defaultFrom;
    emailTask.to = req.to;
    emailTask.template = req.template;
    emailTask.vars = req.vars;
    emailTask.attachments = req.attachments;
    emailTask.shouldBcc = req.shouldBcc;

    entities.push(emailTask);
  }

  if (entities.length) {
    await m.save(entities);
  }
}

export async function enqueueEmailToUserId(userId: string, template: EmailTemplateType, vars: object) {
  try {
    const user = await getRepository(User).findOne(userId, { relations: ['profile'] });
    if (!user) {
      return;
    }
    const toWhom = getEmailRecipientName(user.profile);
    const { profile: { email } } = user;
    const request: EmailRequest = {
      to: email,
      template,
      vars: {
        ...vars,
        toWhom
      }
    };
    await enqueueEmail(request);
  } catch (err) {
    console.log('Sent out email error'.red, err.message);
    logError(err, null, null, 'Sending email error', userId, template, vars);
  }
}


