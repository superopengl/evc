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
  const company = name || `Company of ${symbol}`;
  return `INSERT INTO public.stock(symbol, company) VALUES ('${symbol}', '${company}') ON CONFLICT (symbol) DO UPDATE SET company = '${company}'`;
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

  const cacheKey = `${apiPath}?${JSON.stringify(options)}`;
  let data = await redisCache.get(cacheKey);
  if (!data) {
    data = await requestIexApi(apiPath, options);
    if (data) {
      await redisCache.setex(cacheKey, expireSeconds, data);
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

function getChartParam(period, interval): { chartInterval: number, chartLast?: number } {
  const def = {
    '1h': {
      '1m': {
        chartInterval: 1,
        chartLast: 60
      },
    },
    '4h': {
      '1m': {
        chartInterval: 1,
        chartLast: 240
      },
      '3m': {
        chartInterval: 3,
        chartLast: 80
      },
      '5m': {
        chartInterval: 5,
        chartLast: 48
      }
    },
    '1d': {
      '1m': {
        chartInterval: 1,
      },
      '5m': {
        chartInterval: 5,
      },
      '15m': {
        chartInterval: 15,
      },
    },
    '5d': {
      '10m': {
        chartInterval: 1,
      },
      '30m': {
        chartInterval: 3,
      },
      '1h': {
        chartInterval: 6,
      },
    },
    '1m': {
      '30m': {
        chartInterval: 1,
      },
      '1h': {
        chartInterval: 2,
      },
    },
    '1y': {
      '1d': {
        chartInterval: 1,
      }
    }
  }[period];

  const param = def ? def[interval] : null;

  assert(param, 400, `period ${period} and interval ${interval} is an unsupported combination`);
  return param;
}

export async function getChart(symbol: string, period: string, interval: string) {
  let apiPath = '';
  const param = getChartParam(period, interval);

  switch (period) {
    case '1h':
    case '4h':
    case '1d':
      apiPath = `/stock/${symbol}/intraday-prices`;
      break;
    case '5d':
      apiPath = `/stock/${symbol}/chart/5dm`;
      break;
    case '1m':
      apiPath = `/stock/${symbol}/chart/1mm`;
      break;
    case '1y':
      apiPath = `/stock/${symbol}/chart/1y`;
      break;
    default:
      assert(false, 400, `Unsupported period ${period}`);
  }

  return await requestAndCache(
    apiPath,
    new FixedPeriodCacheStrategy('1 minute'),
    { includeToday: true, chartIEXWhenNull: true, ...param }
  );

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