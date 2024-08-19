import { httpDelete, httpGet, httpPost } from './http';

export async function refreshMaterializedViews() {
  return httpPost(`admin/refresh_mv`);
}

export async function flushCache() {
  return httpPost(`admin/flush_cache`);
}

export async function getOperationStatus(operation) {
  if (!operation) {
    throw new Error(`operation is not specified.`);
  }
  return httpGet(`admin/operation/${operation}/status`);
}

export async function listUnusualOptionsActivity(type, query) {
  if (!type) {
    throw new Error(`operation is not specified.`);
  }
  return httpPost(`/admin/data/uoa/${type}/search`, query);
}

export async function listAdminUnusualOptionsActivity(type, query) {
  if (!type) {
    throw new Error(`operation is not specified.`);
  }
  return httpPost(`/admin/data/uoa/${type}/admin/search`, query);
}

export async function getCacheKeys() {
  return httpGet(`/admin/cache_keys`);
}

export async function deleteCacheKey(key) {
  if (!key) {
    throw new Error(`key is not specified.`);
  }
  return httpDelete(`/admin/cache_keys/${key}`);
}

export async function getCacheKeyedValue(key) {
  if (!key) {
    throw new Error(`key is not specified.`);
  }
  return httpGet(`/admin/cache_keys/${key}`);
}



