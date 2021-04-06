import { getRepository, getManager } from 'typeorm';
import { start } from './jobStarter';
import { isUSMarketOpen } from '../src/services/iexService';
import * as _ from 'lodash';
import { CoreDataPreviousSnapshot } from '../src/entity/CoreDataPreviousSnapshot';
import { CoreDataLatestSnapshot } from '../src/entity/views/CoreDataLatestSnapshot';
import { CoreDataWatchlistEmailTask } from '../src/entity/views/CoreDataWatchlistEmailTask';
import { sendEmail } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';

async function sendCoreDataChangedEmails() {
  const list = await getRepository(CoreDataWatchlistEmailTask).find();

  for (const item of list) {
    await sendEmailByRow(item);
  }
}

async function sendEmailByRow(item: CoreDataWatchlistEmailTask) {
  const { email, givenName, surname, symbol } = item;
  const name = `${givenName || ''} ${surname || ''}`.trim() || 'Client';
  await sendEmail({
    to: email,
    template: EmailTemplateType.WatchlistCoreDataChangedEmail,
    shouldBcc: false,
    vars: {
      toWhom: name,
      symbol,
    }
  }, false);
}

async function promoteLatestSnapshotToPreviousSnapshot() {
  // const result = await getManager()
  //   .createQueryBuilder()
  //   .delete()
  //   .from(CoreDataPreviousSnapshot)
  //   .execute();

  const { tableName: fromTableName, schema: fromSchema } = getRepository(CoreDataLatestSnapshot).metadata;
  const { tableName: toTableName, schema: toSchema } = getRepository(CoreDataPreviousSnapshot).metadata;

  await getManager().transaction(async m => {
    await m.delete(CoreDataPreviousSnapshot, {});
    const sql = `INSERT INTO "${toSchema}"."${toTableName}" SELECT * FROM "${fromSchema}"."${fromTableName}"`;
    await m.query(sql);
  });
}


const JOB_NAME = 'daily-watchlist-email';

start(JOB_NAME, async () => {

  const isMarketOpen = await isUSMarketOpen();
  if (isMarketOpen) {
    console.warn('Market is still open');
    return;
  }

  await sendCoreDataChangedEmails();
  await promoteLatestSnapshotToPreviousSnapshot();
});
