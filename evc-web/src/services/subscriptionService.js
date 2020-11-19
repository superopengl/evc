import { httpGet, httpPost, httpDelete } from './http';


export async function cancelSubscription(id) {
  return httpPost(`subscription/${id}/cancel`);
}

export async function settleSubscription(id) {
  return httpPost(`subscription/${id}/settle`);
}

export async function provisionSubscription(payload) {
  return httpPost(`subscription`, payload);
}


