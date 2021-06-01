import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
import 'colors';
import { assert } from '../utils/assert';

async function requestIexApi(relativeApiPath: string, query?: object) {
  const path = relativeApiPath.replace(/^\/+|\/+$/g, '');
  const queryParams = queryString.stringify({
    ...query,
    token: process.env.IEXCLOUD_PUBLIC_KEY
  });
  const url = `${process.env.IEXCLOUD_API_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/${path}?${queryParams}`;
  const resp = await fetch(url, query);
  console.debug('iex request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }
  return resp.json();
}

export async function getMarketMostActive() {
  return await requestIexApi('/stock/market/list/mostactive');
}

export async function getMarketGainers() {
  // Cannot add listLimit=5 query param because iex API has a bug that adding listLimit will return nothing.
  return await requestIexApi('/stock/market/list/gainers');
}

export async function getMarketLosers() {
  return await requestIexApi('/stock/market/list/losers');
}

export async function getInsiderRoster(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/insider-roster`);
}

export async function getInsiderSummary(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/insider-summary`);
}

export async function getStockLogoUrl(symbol: string) {
  const result = await requestIexApi(`/stock/${symbol}/logo`);
  return result?.url;
}

export async function getInsiderTransactions(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/insider-transactions`);
}

export async function getNews(symbol: string) {
  const list = await requestIexApi(`/stock/${symbol}/news/last/50`);
  return (list ?? [])
    .filter(x => x.lang === 'en')
    .map(x => ({
      ...x,
      image: `${x.image}?token=${process.env.IEXCLOUD_PUBLIC_KEY}`,
      url: `${x.url}?token=${process.env.IEXCLOUD_PUBLIC_KEY}`
    }));
}

export async function getEarnings(symbol: string, last = 1) {
  const resp = await requestIexApi(`/stock/${symbol}/earnings/${last}`);
  const { earnings } = resp ?? {};
  return earnings;
}

export async function getLastThreeMonthDailyPrice(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/chart/3m`);
}

export async function getQuote(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/quote`);
}

export async function isUSMarketOpen(): Promise<boolean> {
  const result = await requestIexApi(`/stock/AAPL/quote`);
  const { isUSMarketOpen } = result;
  return !!isUSMarketOpen;
}

export async function singleBatchRequest(symbols: string[], types: string[], params?: {}) {
  const len = symbols.length;
  assert(0 < len && len <= 100, 400, `Wrong size of iex batch request ${len}`);
  return await requestIexApi('/stock/market/batch', {
    ...params,
    symbols: symbols.join(','),
    types: types.join(',')
  });
}

export async function batchRequest(symbols: string[], types: string[], options?: {}) {
  const batchSize = 100;
  let batchSymbols = [];
  const result = {};
  for (const symbol of symbols) {
    batchSymbols.push(symbol);
    if (batchSymbols.length === batchSize) {
      const resp = await singleBatchRequest(batchSymbols, types, options);
      Object.assign(result, resp);
      batchSymbols = [];
    }
  }

  if (batchSymbols.length > 0) {
    const resp = await singleBatchRequest(batchSymbols, types, options);
    Object.assign(result, resp);
  }

  return result;
}