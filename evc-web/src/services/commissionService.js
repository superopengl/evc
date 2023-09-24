import { httpGet, httpPost } from './http';

export async function getCommissionWithdrawal(id) {
  return httpGet(`commission_withdrawal/${id}`);
}

export async function listMyCommissionWithdrawal() {
  return httpGet(`commission_withdrawal`);
}

export async function searchCommissionWithdrawal(query) {
  return httpPost(`commission_withdrawal/search`, query);
}

export async function createCommissionWithdrawal(payload) {
  return httpPost(`commission_withdrawal`, payload);
}

export async function changeCommissionWithdrawalStatus(id, status, comment) {
  return httpPost(`commission_withdrawal/${id}`, { status, comment });
}

