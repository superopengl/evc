import { httpGet } from './http';

export async function getDashboard() {
  return httpGet(`dashboard`);
}

