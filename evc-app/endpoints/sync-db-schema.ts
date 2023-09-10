import { start } from './jobStarter';

const JOB_NAME = 'sync-db-schema';
const shouldSyncSchema = true;

start(JOB_NAME, async () => {
  // Does nothing
}, shouldSyncSchema);
