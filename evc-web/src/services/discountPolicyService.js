import { httpGet, httpPost, httpDelete } from './http';

export async function listDiscountGlobalPolicies() {
  return httpGet(`discount_policy/global`);
}

export async function saveDiscountGlobalPolicy(policy) {
  return httpPost(`discount_policy/global`, policy);
}

export async function enableDiscountGlobalPolicy(policyId, enabled) {
  return httpPost(`discount_policy/${policyId}/enable`, {enabled});
}

export async function getDiscountUserPolicy(userId) {
  return httpGet(`user/${userId}/discount_policy`);
}

export async function saveDiscountUserPolicy(userId, policy) {
  return httpPost(`user/${userId}/discount_policy`, policy);
}

export async function deleteDiscountUserPolicy(userId) {
  return httpDelete(`user/${userId}/discount_policy`);
}
