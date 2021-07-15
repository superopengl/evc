import { getRepository, getManager } from 'typeorm';
import { SupportResistancePreviousSnapshot } from '../src/entity/SupportResistancePreviousSnapshot';
import { SupportResistanceLatestSnapshot } from '../src/entity/views/SupportResistanceLatestSnapshot';
import { SupportResistanceWatchlistEmailTask } from '../src/entity/views/SupportResistanceWatchlistEmailTask';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';

async function sendSupportResistanceChangedEmailByRow(item: SupportResistanceWatchlistEmailTask) {
  const { email, givenName, surname, symbol } = item;
  const name = `${givenName || ''} ${surname || ''}`.trim() || 'Client';
  await enqueueEmail({
    to: email,
    template: EmailTemplateType.WatchlistSupportResistanceChangedEmail,
    shouldBcc: false,
    vars: {
      toWhom: name,
      symbol,
    }
  });
}

async function sendSupportResistanceChangedEmails() {
  const list = await getRepository(SupportResistanceWatchlistEmailTask).find();

  for (const item of list) {
    await sendSupportResistanceChangedEmailByRow(item);
  }
}

async function promoteSupportResistanceLatestSnapshotToPreviousSnapshot() {
  const { tableName: fromTableName, schema: fromSchema } = getRepository(SupportResistanceLatestSnapshot).metadata;
  const { tableName: toTableName, schema: toSchema } = getRepository(SupportResistancePreviousSnapshot).metadata;

  await getManager().transaction(async m => {
    await m.delete(SupportResistancePreviousSnapshot, {});
    const sql = `INSERT INTO "${toSchema}"."${toTableName}" (symbol, supports, resistances, hash, "date") SELECT symbol, supports, resistances, hash, "date" FROM "${fromSchema}"."${fromTableName}"`;
    await m.query(sql);
  });
}

export async function handleWatchlistSupportResistanceChangedNotification() {
  console.log(`Sending watchlist support/resistance changed notification emails`);
  await sendSupportResistanceChangedEmails();
  await promoteSupportResistanceLatestSnapshotToPreviousSnapshot();
}
