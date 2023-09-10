import { Connection } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import 'colors';
import * as dotenv from 'dotenv';
import { logDataEvent } from '../src/services/dataLogService';
import { v4 as uuidv4 } from 'uuid';

export const start = async (jobName: string, jobFunc: () => Promise<any>, syncSchema = false) => {
  let connection: Connection = null;
  const eventId = uuidv4();
  try {
    dotenv.config();
    connection = await connectDatabase(syncSchema);
    console.log('Task', jobName, 'started');
    await logDataEvent({ eventId, eventType: jobName, status: 'started', by: 'task' })
    await jobFunc();
    console.log('Task', jobName, 'done');
    await logDataEvent({ eventId, eventType: jobName, status: 'done', by: 'task' })
  } catch (e) {
    const jsonError = errorToJson(e);
    console.error('Task', jobName, 'failed', jsonError);
    await logDataEvent({ eventId, eventType: jobName, status: 'error', by: 'task', data: jsonError })
  } finally {
    try {
      await connection?.close();
    } catch {
    }
    process.exit();
  }
};
