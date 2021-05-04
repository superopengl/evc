import { httpDelete, httpGet, httpPost } from './http';

export async function refreshMaterializedViews() {
  return httpPost(`admin/refresh_mv?operation=refresh-mv`);
}

export async function flushCache() {
  return httpPost(`admin/flush_cache?operation=flush-cache`);
}

export async function getOperationStatus(operation) {
  if(!operation) {
    throw new Error(`operation is not specified.`);
  }
  return httpGet(`admin/operation/${operation}/status`);
}

export async function listUnusualOptionsActivity(type, query) {
  if(!type) {
    throw new Error(`operation is not specified.`);
  }
  return httpGet(`/admin/data/uoa/${type}`, query);
}

export async function listAdminUnusualOptionsActivity(type, query) {
  if(!type) {
    throw new Error(`operation is not specified.`);
  }
  return httpGet(`/admin/data/uoa/${type}/admin`, query);
}