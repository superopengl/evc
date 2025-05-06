import fs from 'fs';
import handlebars from 'handlebars';
import moment from 'moment';
import { PaymentMethod } from '../types/PaymentMethod';
import _ from 'lodash';
import { SubscriptionType } from '../types/SubscriptionType';
import { assert } from '../utils/assert';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { generatePdfBufferFromHtml } from '../utils/generatePdfBufferFromHtml';

const receiptTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/receipt_template.html`);
const compiledTemplate = handlebars.compile(receiptTemplateHtml.toString());


function getPaymentMethodName(paymentMethod: PaymentMethod) {
  return _.capitalize(paymentMethod);
}

function getSubscriptionDescription(receipt: ReceiptInformation) {
  const type = receipt.subscriptionType;

  const subscriptionName = type === SubscriptionType.UnlimitedMontly ? 'Pro Member Monthly' :
    type === SubscriptionType.UnlimitedYearly ? 'Pro Member Annually' :
      null;
  assert(subscriptionName, 400, `Unsupported subscription type for receipt ${type}`);

  const start = moment(receipt.start).format('D MMM YYYY');
  const end = moment(receipt.end).format('D MMM YYYY');

  return `${subscriptionName} (${start} - ${end})`;
}

function getVars(receipt: ReceiptInformation) {
  const subscriptionPrice = (+receipt.payable || 0) + (+receipt.deduction || 0);
  if (receipt.method === PaymentMethod.AliPay) {
    return {
      receiptNumber: receipt.receiptNumber,
      date: moment(receipt.paidAt).format('D MMM YYYY'),
      subscriptionDescription: getSubscriptionDescription(receipt),
      subscriptionPrice: subscriptionPrice.toFixed(2),
      creditDeduction: (+receipt.deduction || 0).toFixed(2),
      payableAmount: (+receipt.payableCny || 0).toFixed(2),
      paymentMethod: getPaymentMethodName(receipt.method),
      symbol: '¥',
      currency: 'CNY',
      total: (+(receipt.payableCny)).toFixed(2)
    };
  }
  return {
    receiptNumber: receipt.receiptNumber,
    date: moment(receipt.paidAt).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(receipt),
    subscriptionPrice: subscriptionPrice.toFixed(2),
    creditDeduction: (+receipt.deduction || 0).toFixed(2),
    payableAmount: (+receipt.payable || 0).toFixed(2),
    paymentMethod: getPaymentMethodName(receipt.method),
    symbol: '$',
    currency: 'USD',
    total: subscriptionPrice.toFixed(2)
  };
}

export async function generateReceiptPdfStream(receipt: ReceiptInformation): Promise<{ pdfBuffer: Buffer; fileName: string }> {
  const vars = getVars(receipt);
  const html = compiledTemplate(vars);

  const pdfBuffer = await generatePdfBufferFromHtml(html);
  const fileName = `Receipt_${vars.receiptNumber}.pdf`;

  return { pdfBuffer, fileName };
}