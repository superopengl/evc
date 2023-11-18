import { httpGet, httpPost, httpDelete } from './http';

export async function listCommissionGlobalPolicies() {
  return httpGet(`commission_policy/global`);
}

export async function saveCommissionGlobalPolicy(policy) {
  return httpPost(`commission_policy/global`, policy);
}

export async function enableCommissionGlobalPolicy(policyId, enabled) {
  return httpPost(`commission_policy/${policyId}/enable`, {enabled});
}

export async function getCommissionUserPolicy(userId) {
  return httpGet(`user/${userId}/commission_policy`);
}

export async function saveCommissionUserPolicy(userId, policy) {
  return httpPost(`user/${userId}/commission_policy`, policy);
}

export async function deleteCommissionUserPolicy(userId) {
  return httpDelete(`user/${userId}/commission_policy`);
}
