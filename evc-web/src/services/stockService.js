import { httpGet, httpPost, httpDelete } from './http';

export async function searchStock(payload) {
  return httpPost(`stock/search`, { page: 0, size: 20, ...payload });
}

export async function getStock(symbol) {
  return httpGet(`stock/${symbol}`);
}

export async function incrementStock(symbol) {
  return httpGet(`stock/${symbol}/inc`);
}

export async function listHotStock(size = 10) {
  return httpGet(`stock/hot`, { size });
}

export async function getStockHistory(symbol) {
  return httpGet(`stock/${symbol}/history`);
}

export async function listStock() {
  return httpGet(`stock/list`);
}

export async function deleteStock(symbol) {
  return httpDelete(`stock/${symbol}`);
}

export async function saveStock(stock) {
  return httpPost(`stock`, stock);
}