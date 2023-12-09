import { getRepository, getManager } from 'typeorm';
import { FairValuePreviousSnapshot } from '../src/entity/FairValuePreviousSnapshot';
import { FairValueLatestSnapshot } from '../src/entity/views/FairValueLatestSnapshot';
import { FairValueWatchlistEmailTask } from '../src/entity/views/FairValueWatchlistEmailTask';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';

async function sendFairValueChangedEmailByRow(item: FairValueWatchlistEmailTask) {
  const { email, givenName, surname, symbol } = item;
  const name = `${givenName || ''} ${surname || ''}`.trim() || 'Client';
  await enqueueEmail({
    to: email,
    template: EmailTemplateType.WatchlistFairValueChangedEmail,
    shouldBcc: false,
    vars: {
      toWhom: name,
      symbol,
    }
  });
}

async function sendFairValueChangedEmails() {
  const list = await getRepository(FairValueWatchlistEmailTask).find();

  for (const item of list) {
    await sendFairValueChangedEmailByRow(item);
  }
}

async function promoteFairValueLatestSnapshotToPreviousSnapshot() {
  const { tableName: fromTableName, schema: fromSchema } = getRepository(FairValueLatestSnapshot).metadata;
  const { tableName: toTableName, schema: toSchema } = getRepository(FairValuePreviousSnapshot).metadata;

  await getManager().transaction(async m => {
    await m.delete(FairValuePreviousSnapshot, {});
    const sql = `INSERT INTO "${toSchema}"."${toTableName}" SELECT * FROM "${fromSchema}"."${fromTableName}"`;
    await m.query(sql);
  });
}

export async function handleWatchlistFairValueChangedNotification() {
  console.log(`Sending watchlist fair value changed notification emails`);
  await sendFairValueChangedEmails();
  await promoteFairValueLatestSnapshotToPreviousSnapshot();
}
