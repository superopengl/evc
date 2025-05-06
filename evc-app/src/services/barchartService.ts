import queryString from 'query-string';
import 'colors';
import { assert } from '../utils/assert';
import cookieParser from 'set-cookie-parser';
import * as cookieUril from 'cookie';
import moment from 'moment';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

function getRequestCookies(resp) {
  const setCookieHeaders = resp.headers['set-cookie'];
  const splitCookieHeaders = cookieParser.splitCookiesString(setCookieHeaders);
  const cookies = cookieParser.parse(splitCookieHeaders, { decodeValues: true, map: true });
  const rawCookie = setCookieHeaders.join(';');
  return {
    xsrfToken: cookies['XSRF-TOKEN']?.value,
    laravelToken: cookies['laravel_token']?.value,
    laravelSession: cookies['laravel_session']?.value,
    rawCookie: rawCookie,
  };
}

async function grabOptionHistory(tokens, symbol, limit) {
  const url = 'https://www.barchart.com/proxies/core-api/v1/options-historical/get';
  const { xsrfToken, rawCookie, laravelToken } = tokens;

  console.debug(`barchart request option-history for ${symbol}`.bgMagenta.white, url.magenta);

  const resp = await axios(url, {
    method: 'GET',
    params: {
      symbol,
      fields: 'date,putCallVolumeRatio,totalVolume,putCallOpenInterestRatio,totalOpenInterest',
      orderBy: 'date',
      orderDir: 'desc',
      limit,
      raw: 1,
    },
    headers: {
      // 'x-xsrf-token': xsrfToken,
      // 'cookie': cookieString,
      'x-xsrf-token': xsrfToken,
      'cookie': `laravel_token=${encodeURIComponent(laravelToken)}`,
      withCredentials: true,
    },
    responseType: 'json',
  });

  if (!/^2/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed response for option-history from BarChart (${resp.status}: ${resp.data})`);
  }
  const respBody = resp.data;
  const { count, total, data } = respBody;
  return { count, total, data };
}

async function getBarChartAccessByLogin(email, password) {
  const guestTokens = await getBarChartGuestAccess();
  const { xsrfToken, laravelSession, laravelToken } = guestTokens;

  const url = 'https://www.barchart.com/login';
  const resp = await axios(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Referer': 'https://www.barchart.com/login',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-xsrf-token': xsrfToken,
      cookie: `laravel_token=${encodeURIComponent(laravelToken)};laravel_session=${encodeURIComponent(laravelSession)}`,
    },
    data: {
      email,
      password,
      remember: true,
      refcode: null,
    },
    responseType: 'json',
  });

  console.debug('barchart poke request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }

  if (!/^2/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed to poke BarChart (${resp.status}: ${resp.data})`);
  }

  const tokens = getRequestCookies(resp);

  if (!tokens.laravelToken) {
    throw new Error('Failed to get laravel_token from BarChart response cookie');
  }

  if (!tokens.xsrfToken) {
    throw new Error('Failed to get XSRF-TOKEN from BarChart response cookie');
  }

  console.debug('x-xsrf-token', tokens.xsrfToken);
  console.debug('cookie', `laravel_token=${encodeURIComponent(tokens.laravelToken)}`);

  return tokens;
}

async function getBarChartGuestAccess() {
  const url = 'https://www.barchart.com/options/unusual-activity/stocks';
  const resp = await axios(url);
  console.debug('barchart poke request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }

  if (!/^2/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed to poke BarChart (${resp.status}: ${resp.data})`);
  }

  const tokens = getRequestCookies(resp);

  if (!tokens.laravelToken) {
    throw new Error('Failed to get laravel_token from BarChart response cookie');
  }

  if (!tokens.xsrfToken) {
    throw new Error('Failed to get XSRF-TOKEN from BarChart response cookie');
  }

  console.debug('x-xsrf-token', tokens.xsrfToken);
  console.debug('cookie', `laravel_token=${encodeURIComponent(tokens.laravelToken)}`);

  return tokens;
}

async function grabOptionsData(tokens, type: 'stock' | 'etf' | 'index', page) {
  const todayString = moment().format('YYYY-MM-DD');
  const query = {
    fields: 'baseSymbol,baseLastPrice,symbolType,strikePrice,expirationDate,daysToExpiration,bidPrice,midpoint,askPrice,lastPrice,volume,openInterest,volumeOpenInterestRatio,volatility,tradeTime,symbolCode',
    baseSymbolTypes: type,
    'between(volumeOpenInterestRatio,1.5,)': '',
    'between(lastPrice,.10,)': '',
    [`between(tradeTime,${todayString},)`]: '',
    'between(volume,500,)': '',
    'between(openInterest,100,)': '',
    page,
    limit: 1000
  };
  const url = 'https://www.barchart.com/proxies/core-api/v1/options/get';

  const { xsrfToken, laravelToken } = tokens;
  const options = {
    method: 'GET',
    headers: {
      'x-xsrf-token': xsrfToken,
      cookie: `laravel_token=${encodeURIComponent(laravelToken)}`,
    }
  };

  console.debug(`barchart request for ${type}`.bgMagenta.white, url.magenta);

  const resp = await axios(url, {
    method: 'GET',
    params: {
      fields: 'baseSymbol,baseLastPrice,symbolType,strikePrice,expirationDate,daysToExpiration,bidPrice,midpoint,askPrice,lastPrice,volume,openInterest,volumeOpenInterestRatio,volatility,tradeTime,symbolCode',
      baseSymbolTypes: type,
      'between(volumeOpenInterestRatio,1.5,)': '',
      'between(lastPrice,.10,)': '',
      [`between(tradeTime,${todayString},)`]: '',
      'between(volume,500,)': '',
      'between(openInterest,100,)': '',
      page,
      limit: 1000
    },
    headers: {
      'x-xsrf-token': xsrfToken,
      cookie: `laravel_token=${encodeURIComponent(laravelToken)}`,
    },
    responseType: 'json',
  });
  if (!/^2/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed response from BarChart (${resp.status}: ${await resp.data})`);
  }
  const respBody = await resp.data;
  const { count, total, data } = respBody;

  console.debug('response count:', count, 'total:', total);

  return { count, total, page, data };
}

async function grabDataByType(tokens, type: 'stock' | 'etf' | 'index') {
  const allData = [];

  let page = 1;
  let totalReceived = 0;
  while (true) {
    const { count, total, data } = await grabOptionsData(tokens, type, page);
    totalReceived += count;
    allData.push(...data);
    page++;
    if (totalReceived >= total) {
      break;
    }
  }

  return allData;
}

export async function grabAllUnusualOptionActivity(type) {
  const tokens = await getBarChartGuestAccess();
  return await grabDataByType(tokens, type);
}

export async function grabOptionPutCallHistory(symbol, days) {
  // const tokens = await getBarChartAccessByLogin('dayaozi666@gmail.com', '198361124');
  const tokens = await getBarChartGuestAccess();
  const result = await grabOptionHistory(tokens, symbol, days);
  return result.data ?? [];
}