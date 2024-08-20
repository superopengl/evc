import queryString from 'query-string';
import _ from 'lodash';
import fetch from 'node-fetch';
import parse from 'csv-parse/lib/sync';
import moment from 'moment';

// const alphaApi = alphavantage({key: process.env.ALPHAVANTAGE_API_KEY});

export async function getEarnings(symbol: string, howManyQuarters = 4) {
  const rawResponse = await requestAlphaVantageApi({
    function: 'EARNINGS',
    symbol,
  });
  const quarterlyEarnings = rawResponse?.quarterlyEarnings || [];
  const earnings = _.chain(quarterlyEarnings)
    .filter(x => _.isFinite(+(x.reportedEPS)))
    .take(howManyQuarters)
    .value();
  return { earnings, rawResponse };
}

export async function getGlobalQuotePrice(symbol: string) {
  const rawResponse = await requestAlphaVantageApi({
    function: 'GLOBAL_QUOTE',
    symbol,
  });
  const quote = rawResponse?.['Global Quote'] || {};

  return {
    open: +quote['02. open'],
    latestPrice: +quote['05. price'],
    change: +quote['09. change'],
    changePercent: +(quote['10. change percent'].replace('%', '')) / 100,
    latestUpdate: moment(quote['07. latest trading day'], 'YYYY-MM-DD').toDate(),
  };
}

export async function getPostMarketPrice(symbol: string, inMarketInfo: { open: number, latestPrice: number }) {
  const rawResponse = await requestAlphaVantageApi({
    function: 'TIME_SERIES_INTRADAY',
    symbol,
    outputsize: 'compact',
    extended_hours: true,
    adjusted: true,
    interval: '1min'
  });
  const timeSeries = rawResponse?.['Time Series (1min)'];
  if (!timeSeries) {
    return null;
  }

  const keys = Object.keys(timeSeries);
  const latestTimeKey = keys[0];
  // const firstTimeKey = keys[keys.length - 1];

  const parseItem = (timeItem) => {
    return {
      open: +timeItem['1. open'],
      high: +timeItem['2. high'],
      low: +timeItem['3. low'],
      close: +timeItem['4. close'],
    }
  }

  const last = parseItem(timeSeries[latestTimeKey])

  return {
    extendedPrice: last.close,
    extendedChange: last.close - inMarketInfo.latestPrice,
    extendedChangePercent: (last.close - inMarketInfo.latestPrice) / inMarketInfo.latestPrice,
    extendedPriceTime: moment(latestTimeKey, 'YYYY-MM-DD HH:mm:ss').toDate(),
  };
}

export async function getHistoricalClose(symbol: string, days = 1) {
  const resp = await requestAlphaVantageApi({
    function: 'TIME_SERIES_DAILY',
    symbol,
    datatype: 'json',
    outputsize: days <= 100 ? 'compact' : 'full'
  });
  const data = resp['Time Series (Daily)'];
  if (!data) {
    return [];
  }

  const result = _.chain(Object.entries(data))
    .map(([date, value]) => ({
      date,
      close: value['4. close']
    }))
    .filter(x => _.isFinite(+(x.close)))
    .take(days)
    .value();

  return result;
}

export async function getEarningsCalendarForAll(): Promise<{ symbol: string, reportDate: string }[]> {
  const data = await requestAlphaVantageApi({
    function: 'EARNINGS_CALENDAR',
    horizon: '12month',
    // symbol: 'AAPL'
  }, 'text');

  const rows = parse(data, {
    columns: true,
    skip_empty_lines: true
  });

  return rows;
}

async function getCompanyOverview(symbol: string) {
  const data = await requestAlphaVantageApi({
    function: 'OVERVIEW',
    symbol
  });

  return data;
}

export async function getCompanyName(symbol: string) {
  const data = await getCompanyOverview(symbol);
  return data?.Name;
}

export async function getTopGainersLosers() {
  const data = await requestAlphaVantageApi({
    function: 'TOP_GAINERS_LOSERS',
  });
  return data;
}

export async function getNews(symbol: string) {
  const data = await requestAlphaVantageApi({
    function: 'NEWS_SENTIMENT',
    tickers: symbol,
  });

  return data?.feed ?? [];
}

export async function getAdvancedStat(symbol: string) {
  const data = await getCompanyOverview(symbol);

  return data;
}

async function requestAlphaVantageApi(query?: object, format: 'json' | 'text' = 'json') {
  const queryParams = queryString.stringify({
    ...query,
    apikey: process.env.ALPHAVANTAGE_API_KEY
  });
  const url = `${process.env.ALPHAVANTAGE_API_ENDPOINT}/query?${queryParams}`;
  const resp = await fetch(url, { timeout: 10000 });
  console.debug('alphavantage request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }
  return format === 'json' ? resp.json() : resp.text();
}