import { httpGet, httpPost, httpDelete } from './http';

export async function getDebugInfo() {
  return httpGet(`debug`);
}

