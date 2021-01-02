import { Connection } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import 'colors';
import * as dotenv from 'dotenv';

export const start = async (jobName: string, jobFunc: () => Promise<any>) => {
  let connection: Connection = null;
  try {
    dotenv.config();
    connection = await connectDatabase();
    console.log('Task', jobName, 'started');
    await jobFunc();
    console.log('Task', jobName, 'done');
  } catch (e) {
    console.error('Task', jobName, 'failed', errorToJson(e));
  } finally {
    // try {
    //   connection?.close();
    // } catch {
    //   // Do nothing
    // }
  }
};
