import { httpGet, httpPost, httpDelete } from './http';

export async function searchStock(payload) {
  return httpPost(`stock/search`, { page: 0, size: 20, ...payload });
}

export async function getStock(symbol) {
  return httpGet(`stock/s/${symbol}`);
}

export async function incrementStock(symbol) {
  return httpGet(`stock/s/${symbol}/inc`);
}

export async function listHotStock(size = 10) {
  return httpGet(`stock/hot`, { size });
}

export async function getStockHistory(symbol) {
  return httpGet(`stock/s/${symbol}/history`);
}

export async function listStock() {
  return httpGet(`stock/list`);
}

export async function deleteStock(symbol) {
  return httpDelete(`stock/s/${symbol}`);
}

export async function saveStock(stock) {
  return httpPost(`stock`, stock);
}

export async function getWatchList() {
  return httpGet(`stock/watchlist`);
}

export async function watchStock(symbol) {
  return httpPost(`stock/s/${symbol}/watch`);
}

export async function unwatchStock(symbol) {
  return httpPost(`stock/s/${symbol}/unwatch`);
}

export async function listStockSupport(symbol) {
  return httpGet(`stock/s/${symbol}/support`);
}

export async function saveStockSupport(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/support`, { lo, hi });
}

export async function listStockResistance(symbol) {
  return httpGet(`stock/s/${symbol}/resistance`);
}

export async function saveStockResistance(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/resistance`, { lo, hi });
}

export async function listStockPe(symbol) {
  return httpGet(`stock/s/${symbol}/pe`);
}

export async function saveStockPe(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/pe`, { lo, hi });
}