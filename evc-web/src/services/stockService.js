import { httpGet, httpPost, httpDelete, httpPut } from './http';

export async function searchStock(payload) {
  return httpPost(`stock/search`, { page: 0, size: 20, ...payload });
}

export async function searchSingleStock(symbol) {
  if (!symbol) {
    throw new Error(`Symbol is not specified`);
  }
  return httpPost(`stock/search/${symbol}`);
}

export async function getStock(symbol) {
  return httpGet(`stock/s/${symbol}`);
}

export async function getStockForGuest(symbol) {
  return httpGet(`stock/s/${symbol}/guest_info`);
}

export async function getStockNextReportDate(symbol) {
  return httpGet(`stock/s/${symbol}/next_report_date`);
}

export async function getStockEvcInfo(symbol) {
  return httpGet(`stock/s/${symbol}/evc_info`);
}

export async function getStockDataInfo(symbol) {
  return httpGet(`stock/s/${symbol}/data_info`);
}

export async function incrementStock(symbol) {
  return httpGet(`stock/s/${symbol}/inc`);
}

export async function listHotStock(size = 10) {
  return httpGet(`stock/hot`, { size });
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
  return httpPost(`stock/s/${stock.symbol}`, stock);
}

export async function listStockSupport(symbol) {
  return httpGet(`stock/s/${symbol}/support`);
}

export async function saveStockSupport(symbol, lo, hi) {
  return httpPost(`stock/s/${symbol}/support`, { lo, hi });
}

export async function existsStock(symbol) {
  return httpGet(`stock/s/${symbol}/exists`);
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

export async function deleteStockEps(symbol, reportDate) {
  return httpDelete(`stock/eps/${symbol}/${reportDate}`);
}

export async function listStockFairValue(symbol) {
  return httpGet(`stock/s/${symbol}/fairvalue`);
}

export async function saveStockFairValue(symbol, payload) {
  return httpPost(`stock/s/${symbol}/fairvalue`, payload);
}

export async function deleteStockFairValue(id) {
  return httpDelete(`stock/fairvalue/${id}`);
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

export async function getEarningsCalender(week = 0) {
  return httpGet(`/stock/data/earnings_calendar`, { week });
}

export async function getStockInsiderTransaction(symbol) {
  return httpGet(`/stock/s/${symbol}/insider`);
}

export async function getStockRoster(symbol) {
  return httpGet(`/stock/s/${symbol}/roster`);
}

export async function getStockNews(symbol) {
  return httpGet(`/stock/s/${symbol}/news`);
}

export async function getStockQuote(symbol) {
  return httpGet(`/stock/s/${symbol}/quote`);
}

export async function getStockPutCallRatioChart(symbol) {
  return httpGet(`/stock/s/${symbol}/chart/putcallratio`);
}

export async function submitStockPlea(symbol) {
  return httpPost(`stock/plea/${symbol}`);
}

export async function deleteStockPlea(symbol) {
  return httpDelete(`stock/plea/${symbol}`);
}