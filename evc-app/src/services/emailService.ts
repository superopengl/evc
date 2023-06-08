import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import { logError } from '../utils/logger';
import { EmailRequest } from '../types/EmailRequest';
import { Locale } from '../types/Locale';
import { getRepository } from 'typeorm';
import { EmailTemplate } from '../entity/EmailTemplate';
import * as handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import { getConfigValue } from './configService';

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


export async function sendEmail(req: EmailRequest, throws = false) {
  const { to, template, vars } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  try {
    const option = await composeEmailOption(req);
    await getEmailer().sendMail(option);
    console.log('Sent out email to', to);
  } catch (err) {
    logError(err, req, null, 'Sending email error', to, template, vars);
    if (throws) {
      throw err;
    }
  }
}


