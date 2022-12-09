import { DataEvent } from "../types/DataEvent";
import { DataLog } from '../entity/DataLog';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import errorToJson from 'error-to-json';

export async function logDataEvent(dataEvent: DataEvent) {
  const log = new DataLog();
  log.eventId = dataEvent.eventId;
  log.eventType = dataEvent.eventType;
  log.level = dataEvent.status;
  log.by = dataEvent.by;
  log.data = dataEvent.data;

  try {
    await getRepository(DataLog).insert(log);
  } catch (e) {
    console.error('Failed to add data log', errorToJson(e));
  }
}

export async function executeWithDataEvents(eventType: string, by: string, fn: () => Promise<void>, options?: any) {
  const eventId = options?.eventId ?? uuidv4();
  try {
    await logDataEvent({ eventId, eventType, by, status: 'started' });
    await fn();
    await logDataEvent({ eventId, eventType, by, status: 'done' });
  } catch (e) {
    await logDataEvent({ eventId, eventType, by, status: 'error', data: errorToJson(e) });
    throw e;
  }
}