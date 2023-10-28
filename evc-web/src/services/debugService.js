import { httpGet } from './http';

export async function getDebugInfo() {
  return httpGet(`debug`);
}

