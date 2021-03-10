export type DataEvent = {
  eventId: string;
  eventType: string;
  status: 'started' | 'done' | 'error';
  by: string;
  data?: any;
};
