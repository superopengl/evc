import { httpGet, httpPost, request, API_BASE_URL } from './http';
export const getEventSource = () => {
  const url = `${API_BASE_URL}/event`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}

export const publishEvent = async (event) => {
  if (!event) throw new Error('Empty event');
  await httpPost('event', event);
}