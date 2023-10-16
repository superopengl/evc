import * as fs from 'fs';
import { Payment } from '../entity/Payment';
import * as pdf from 'html-pdf';
import * as handlebars from 'handlebars';
import { Readable } from 'node:stream';
import * as moment from 'moment';
import { User } from '../entity/User';
import { PaymentMethod } from '../types/PaymentMethod';
import * as _ from 'lodash';
import { SubscriptionType } from '../types/SubscriptionType';
import { assert } from '../utils/assert';
import { getRepository } from 'typeorm';

const receiptTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/receipt_template.html`);
const compiledTemplate = handlebars.compile(receiptTemplateHtml.toString());

async function generatePdfStream(html, options) {
  return new Promise<any>((res, rej) => {
    pdf.create(html, options).toStream((err, stream) => {
      if (err) return rej(err);
      res(stream);
    })
  })
}

function getPaymentMethodName(paymentMethod: PaymentMethod) {
  return _.capitalize(paymentMethod);
}

function getSubscriptionDescription(payment: Payment) {
  const { subscription } = payment;
  const {type} = subscription;

  const subscriptionName = type === SubscriptionType.UnlimitedMontly ? 'Pro Member Monthly' :
    type === SubscriptionType.UnlimitedYearly ? 'Pro Member Annually' :
      null;
  assert(subscriptionName, 400, `Unsupported subscription type for receipt ${type}`);

  const start = moment(payment.paidAt).format('D MMM YYYY');
  const end = moment(subscription.end).format('D MMM YYYY');

  return `${subscriptionName} (${start} - ${end})`;
}

function getVars(payment: Payment, user: User) {
  const creditDeduction = payment.creditTransaction?.amount || 0;
  const payableAmount = payment.amount || 0;
  const subscriptionPrice = creditDeduction + payableAmount;
  return {
    receiptNo: `${moment(payment.paidAt).format('YYYYMMDD')}-${`${user.seqId}`.padStart(6, '0')}`,
    date: moment(payment.paidAt).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(payment),
    subscriptionPrice: subscriptionPrice.toFixed(2),
    creditDeduction: creditDeduction.toFixed(2),
    payableAmount: payableAmount.toFixed(2),
    paymentMethod: getPaymentMethodName(payment.method)
  };
}

export async function generateReceiptPdfStream(payment: Payment): Promise<{ pdfStream: Readable, fileName: string }> {
  const user = await getRepository(User).findOne(payment.userId);
  const vars = getVars(payment, user);
  const html = compiledTemplate(vars);
  const options = { format: 'A4' };

  const pdfStream = await generatePdfStream(html, options);
  const fileName = `Receipt_${vars.receiptNo}.pdf`;

  return { pdfStream, fileName };
}