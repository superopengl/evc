import * as iex from 'iexcloud_api_wrapper';
import { getManager } from 'typeorm';
import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
import { redisCache } from './redisCache';
import { ICacheStrategy } from '../utils/cacheStrategies/ICacheStrategy';
import { ScheduledClockCacheStrategy } from '../utils/cacheStrategies/ScheduledClockCacheStrategy';
import { FixedPeriodCacheStrategy } from '../utils/cacheStrategies/FixedPeriodCacheStrategy';
import { NoCacheStrategy } from '../utils/cacheStrategies/NoCacheStrategy';
import 'colors';
import { assert } from '../utils/assert';

function composeSingleLine(stock) {
  const { symbol, name } = stock;
  const companyName = name || `Company of ${symbol}`;
  return `INSERT INTO public.stock(symbol, company) VALUES ('${symbol}', '${companyName}') ON CONFLICT (symbol) DO UPDATE SET company = '${companyName}'`;
}

function composeSqlStatement(stocks) {
  return stocks.map(composeSingleLine).join(';\n');
}

async function updateDatabase(stockList) {
  const sql = composeSqlStatement(stockList);
  return await getManager().query(sql);
}

async function requestIexApi(relativeApiPath: string, query?: object) {
  const path = relativeApiPath.replace(/^\/+|\/+$/g, '');
  const queryParams = queryString.stringify({
    ...query,
    token: process.env.IEXCLOUD_PUBLIC_KEY
  })
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

async function requestAndCache(apiPath: string, cacheStrategy: ICacheStrategy, options?: object) {
  const expireSeconds = cacheStrategy?.getExpireSeconds();
  if (!expireSeconds) {
    // No cache
    return await requestIexApi(apiPath, options);
  }

  let data = await redisCache.get(apiPath);
  if (!data) {
    data = await requestIexApi(apiPath, options);
    if (data) {
      await redisCache.setex(apiPath, expireSeconds, data);
    }
  }
  return data;
}

// export async function syncStockSymbols() {
//   const data = await requestIexApi('/ref-data/symbols');
//   // const stocks = await request('/ref-data/region/us/symbols');
//   await updateDatabase(data);
// }

export async function getMarketMostActive() {
  return await requestAndCache('/stock/market/list/mostactive', new FixedPeriodCacheStrategy('1 minute'));
}

export async function getMarketGainers() {
  // Cannot add listLimit=5 query param because iex API has a bug that adding listLimit will return nothing.
  return await requestAndCache('/stock/market/list/gainers', new FixedPeriodCacheStrategy('1 minute'));
}

export async function getMarketLosers() {
  return await requestAndCache('/stock/market/list/losers', new FixedPeriodCacheStrategy('1 minute'));
}

export async function getInsiderRoster(symbol: string) {
  return await requestAndCache(`/stock/${symbol}/insider-roster`, new ScheduledClockCacheStrategy(5, 6));
}

export async function getInsiderSummary(symbol: string) {
  return await requestAndCache(`/stock/${symbol}/insider-summary`, new ScheduledClockCacheStrategy(5, 6));
}

export async function getInsiderTransactions(symbol: string) {
  return await requestAndCache(`/stock/${symbol}/insider-transactions`, new ScheduledClockCacheStrategy(5, 6));
}

export async function getNews(symbol: string) {
  const list = await requestAndCache(`/stock/${symbol}/news/last/10`, new FixedPeriodCacheStrategy('10 minute'));
  return (list ?? [])
    .filter(x => x.lang === 'en')
    .map(x => ({
      ...x,
      image: `${x.image}?token=${process.env.IEXCLOUD_PUBLIC_KEY}`,
      url: `${x.url}?token=${process.env.IEXCLOUD_PUBLIC_KEY}`
    }));
}

export async function getChartIntraday(symbol: string) {
  return await requestAndCache(`/stock/${symbol}/intraday-prices`, new FixedPeriodCacheStrategy('1 minute'));
}

export async function getChart5D(symbol: string) {
  return await requestAndCache(`/stock/${symbol}/chart/5d`, new FixedPeriodCacheStrategy('6 hours'));
}

export async function getEarnings(symbol: string, last = 1) {
  const resp = await requestIexApi(`/stock/${symbol}/earnings/${last}`);
  const { earnings } = resp ?? {};
  return earnings;
}

export async function getQuote(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/quote`);
}

export async function singleBatchRequest(symbols: string[], types: string[], params: {}) {
  const len = symbols.length;
  assert(0 < len && len <= 100, 400, `Wrong size of iex batch request ${len}`);
  return await requestIexApi('/stock/market/batch', {
    ...params,
    symbols: symbols.join(','),
    types: types.join(',')
  })
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