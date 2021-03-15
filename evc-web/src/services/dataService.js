import { httpGet, httpPost } from './http';

export async function refreshMaterializedViews() {
  return httpPost(`admin/refresh_mv?operation=refresh-mv`);
}

export async function getOperationStatus(operation) {
  if(!operation) {
    throw new Error(`operation is not specified.`);
  }
  return httpGet(`admin/operation/${operation}/status`);
}

export async function listUnusalOptionsActivity(type, query) {
  if(!type) {
    throw new Error(`operation is not specified.`);
  }
  return httpGet(`/admin/data/uoa/${type}`, query);
}