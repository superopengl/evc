import queryString from 'query-string';
import _ from 'lodash';
import fetch from 'node-fetch';
import parse from 'csv-parse/lib/sync';

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

export async function getCompanyName(symbol: string) {
  const data = await requestAlphaVantageApi({
    function: 'OVERVIEW',
    symbol
  });

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