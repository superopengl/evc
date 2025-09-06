import { getRepository } from 'typeorm';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { InsiderTransactionWatchlistEmailTask } from '../src/entity/views/InsiderTransactionWatchlistEmailTask';

async function sendEmailByRow(item: InsiderTransactionWatchlistEmailTask) {
  const { email, givenName, surname, symbol } = item;
  const name = `${givenName || ''} ${surname || ''}`.trim() || 'Client';
  await enqueueEmail({
    to: email,
    template: EmailTemplateType.WatchlistInsiderTransactionChangedEmail,
    shouldBcc: false,
    vars: {
      toWhom: name,
      symbol,
    }
  });
}

async function sendInsiderTransactionChangedEmails() {
  const list = await getRepository(InsiderTransactionWatchlistEmailTask).find();

  for (const item of list) {
    await sendEmailByRow(item);
  }
}

export async function handleWatchlistInsiderTransactionNotification() {
  console.log('Sending watchlist insider transaction change emails');
  await sendInsiderTransactionChangedEmails();
}
