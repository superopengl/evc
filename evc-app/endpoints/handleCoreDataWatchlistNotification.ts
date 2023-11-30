import { getRepository, getManager } from 'typeorm';
import { CoreDataPreviousSnapshot } from '../src/entity/CoreDataPreviousSnapshot';
import { CoreDataLatestSnapshot } from '../src/entity/views/CoreDataLatestSnapshot';
import { CoreDataWatchlistEmailTask } from '../src/entity/views/CoreDataWatchlistEmailTask';
import { enqueueEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';

async function sendEmailByRow(item: CoreDataWatchlistEmailTask) {
  const { email, givenName, surname, symbol } = item;
  const name = `${givenName || ''} ${surname || ''}`.trim() || 'Client';
  await enqueueEmail({
    to: email,
    template: EmailTemplateType.WatchlistCoreDataChangedEmail,
    shouldBcc: false,
    vars: {
      toWhom: name,
      symbol,
    }
  });
}

async function sendCoreDataChangedEmails() {
  const list = await getRepository(CoreDataWatchlistEmailTask).find();

  for (const item of list) {
    await sendEmailByRow(item);
  }
}

async function promoteLatestSnapshotToPreviousSnapshot() {
  const { tableName: fromTableName, schema: fromSchema } = getRepository(CoreDataLatestSnapshot).metadata;
  const { tableName: toTableName, schema: toSchema } = getRepository(CoreDataPreviousSnapshot).metadata;

  await getManager().transaction(async m => {
    await m.delete(CoreDataPreviousSnapshot, {});
    const sql = `INSERT INTO "${toSchema}"."${toTableName}" SELECT * FROM "${fromSchema}"."${fromTableName}"`;
    await m.query(sql);
  });
}

export async function handleCoreDataWatchlistNotification() {
  // Send watchlist emails if core data change detected.
  console.log(`Sending watchlist core change emails`);
  await sendCoreDataChangedEmails();
  await promoteLatestSnapshotToPreviousSnapshot();
}
