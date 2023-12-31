import { getRepository, getManager } from 'typeorm';
import { SupportResistancePreviousSnapshot } from '../src/entity/SupportResistancePreviousSnapshot';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { InsiderTransactionWatchlistEmailTask } from '../src/entity/views/InsiderTransactionWatchlistEmailTask';
import { StockInsiderTransaction } from '../src/entity/StockInsiderTransaction';
import { StockInsiderTransactionPreviousSnapshot } from '../src/entity/StockInsiderTransactionPreviousSnapshot';

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

async function promoteLatestSnapshotToPreviousSnapshot() {
  const { tableName: fromTableName, schema: fromSchema } = getRepository(StockInsiderTransaction).metadata;
  const { tableName: toTableName, schema: toSchema } = getRepository(StockInsiderTransactionPreviousSnapshot).metadata;

  await getManager().transaction(async m => {
    await m.delete(StockInsiderTransactionPreviousSnapshot, {});
    const sql = `INSERT INTO "${toSchema}"."${toTableName}" SELECT * FROM "${fromSchema}"."${fromTableName}"`;
    await m.query(sql);
  });
}

export async function handleWatchlistInsiderTransactionNotification() {
  console.log(`Sending watchlist insider transaction change emails`);
  await sendInsiderTransactionChangedEmails();
  await promoteLatestSnapshotToPreviousSnapshot();
}
