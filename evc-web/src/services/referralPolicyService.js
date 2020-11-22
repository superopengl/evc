import { httpGet, httpPost, httpDelete } from './http';

export async function listReferalGlobalPolicies() {
  return httpGet(`referral_policy/global`);
}

export async function saveReferralGlobalPolicy(policy) {
  return httpPost(`referral_policy/global`, policy);
}

export async function enableReferralGlobalPolicy(policyId, enabled) {
  return httpPost(`referral_policy/${policyId}/enable`, {enabled});
}

export async function getReferralUserPolicy(userId) {
  return httpGet(`user/${userId}/referral_policy`);
}

export async function saveReferralUserPolicy(userId, policy) {
  return httpPost(`user/${userId}/referral_policy`, policy);
}