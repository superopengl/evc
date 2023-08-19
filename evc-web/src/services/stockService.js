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

export async function listStockSupport(symbol) {
  return httpGet(`stock/s/${symbol}/support`);
}

export async function saveStockSupport(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/support`, { lo, hi });
}

export async function deleteStockSupport(id) {
  return httpDelete(`stock/support/${id}`);
}

export async function listStockResistance(symbol) {
  return httpGet(`stock/s/${symbol}/resistance`);
}

export async function saveStockResistance(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/resistance`, { lo, hi });
}

export async function deleteStockResistance(id) {
  return httpDelete(`stock/resistance/${id}`);
}

export async function listStockEps(symbol) {
  return httpGet(`stock/s/${symbol}/eps`);
}

export async function saveStockEps(symbol, values) {
  return httpPost(`stock/s/${symbol}/eps`, values);
}

export async function syncStockEps(symbol) {
  return httpPost(`stock/s/${symbol}/eps/sync`);
}

export async function deleteStockEps(id) {
  return httpDelete(`stock/eps/${id}`);
}

export async function listStockPe(symbol) {
  return httpGet(`stock/s/${symbol}/pe`);
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

export async function getMarketMostActive() {
  return httpGet(`/stock/data/mostactive`);
}

export async function getMarketGainers() {
  return httpGet(`/stock/data/gainers`);
}

export async function getMarketLosers() {
  return httpGet(`/stock/data/losers`);
}

export async function getStockInsider(symbol) {
  return httpGet(`/stock/s/${symbol}/insider`);
}

export async function getStockEarnings(symbol) {
  return httpGet(`/stock/s/${symbol}/earnings`);
}

export async function getStockNews(symbol) {
  return httpGet(`/stock/s/${symbol}/news`);
}

export async function getStockQuote(symbol) {
  return httpGet(`/stock/s/${symbol}/quote`);
}

export async function getStockChart(symbol, period, interval) {
  return httpGet(`/stock/s/${symbol}/chart/${period}/${interval}`);
}