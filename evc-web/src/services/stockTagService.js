import { httpGet, httpPost, httpDelete } from './http';

export async function listStockTags() {
  return httpGet(`stocktag`);
}

export async function deleteStockTag(id) {
  return httpDelete(`stocktag/${id}`);
}

export async function saveStockTag(tag) {
  return httpPost(`stocktag`, tag);
}