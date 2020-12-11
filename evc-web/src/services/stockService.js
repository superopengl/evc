import { httpGet, httpPost, httpDelete , httpPut} from './http';

export async function searchStock(payload) {
  return httpPost(`stock/search`, { page: 0, size: 20, ...payload });
}

export async function searchSingleStock(symbol) {
  if(!symbol) {
    throw new Error(`Symbol is not specified`);
  }
  return httpPost(`stock/search/${symbol}`);
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
  // return httpGet(`stock/s/${symbol}/history`);
}

export async function listStock() {
  return httpGet(`stock/list`);
}

export async function deleteStock(symbol) {
  return httpDelete(`stock/s/${symbol}`);
}

export async function createStock(stock) {
  return httpPut(`stock`, stock);
}

export async function updateStock(stock) {
  return httpPost(`stock/${stock.symbol}`, stock);
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

export async function listStockSupportShort(symbol) {
  return httpGet(`stock/s/${symbol}/support/short`);
}

export async function saveStockSupportShort(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/support/short`, { lo, hi });
}

export async function deleteStockSupportShort(id) {
  return httpDelete(`stock/support/short/${id}`);
}

export async function listStockSupportLong(symbol) {
  return httpGet(`stock/s/${symbol}/support/long`);
}

export async function saveStockSupportLong(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/support/long`, { lo, hi });
}

export async function deleteStockSupportLong(id) {
  return httpDelete(`stock/support/long/${id}`);
}

export async function listStockResistanceShort(symbol) {
  return httpGet(`stock/s/${symbol}/resistance/short`);
}

export async function saveStockResistanceShort(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/resistance/short`, { lo, hi });
}

export async function deleteStockResistanceShort(id) {
  return httpDelete(`stock/resistance/short/${id}`);
}

export async function listStockResistanceLong(symbol) {
  return httpGet(`stock/s/${symbol}/resistance/long`);
}

export async function saveStockResistanceLong(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/resistance/long`, { lo, hi });
}

export async function deleteStockResistanceLong(id) {
  return httpDelete(`stock/resistance/long/${id}`);
}

export async function listStockEps(symbol) {
  return httpGet(`stock/s/${symbol}/eps`);
}

export async function saveStockEps(symbol, values) {
  return httpPost(`stock/s/${symbol}/eps`, values);
}

export async function deleteStockEps(id) {
  return httpDelete(`stock/eps/${id}`);
}

export async function listStockPe(symbol) {
  return httpGet(`stock/s/${symbol}/pe`);
}

export async function saveStockPe(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/pe`, { lo, hi });
}

export async function deleteStockPe(id) {
  return httpDelete(`stock/pe/${id}`);
}

export async function listStockFairValue(symbol) {
  return httpGet(`stock/s/${symbol}/value`);
}

export async function saveStockFairValue(symbol, payload) {
  return httpPost(`stock/s/${symbol}/value`, payload);
}

export async function deleteStockFairValue(id) {
  return httpDelete(`stock/value/${id}`);
}

export async function listStockPublish(symbol, verbose = false) {
  return httpGet(`stock/s/${symbol}/publish`, { verbose });
}

export async function saveStockPublish(symbol, payload) {
  return httpPost(`stock/s/${symbol}/publish`, payload);
}

export async function syncStockList() {
  return httpPost(`/stock/data/sync`);
}

export async function getMarketMostActive() {
  return httpGet(`/stock/data/mostactive`);
}

export async function getMarketGainers() {
  return httpGet(`/stock/data/gainers`);
}

export async function getMarketLosers() {
  return httpGet(`/stock/data/losers`);
}