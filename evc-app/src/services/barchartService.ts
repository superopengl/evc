import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
import 'colors';
import { assert } from '../utils/assert';
import * as cookieParser from 'set-cookie-parser';
import * as moment from 'moment';

function getRequestCookies(resp) {
  const combinedCookieHeader = resp.headers.get('Set-Cookie');
  const splitCookieHeaders = cookieParser.splitCookiesString(combinedCookieHeader)
  const cookies = cookieParser.parse(splitCookieHeaders, { decodeValues: true, map: true });
  return {
    xsrfToken: cookies['XSRF-TOKEN']?.value,
    laravelToken: cookies['laravel_token']?.value,
    laravelSession: cookies['laravel_session']?.value,
  }
}

async function getBarChartAccessByLogin(email, password) {
  const guestTokens = await getBarChartGuestAccess();
  const { xsrfToken, laravelSession, laravelToken } = guestTokens;

  const url = `https://www.barchart.com/login`;
  const resp = await fetch(url, {
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "Referer": "https://www.barchart.com/login",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-xsrf-token": xsrfToken,
      cookie: `laravel_token=${encodeURIComponent(laravelToken)};laravel_session=${encodeURIComponent(laravelSession)}`,
    },
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      remember: true,
      refcode: null,
    })
  });

  console.debug('barchart poke request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }

  if (!/^2/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed to poke BarChart (${resp.stastus}: ${resp.text()})`);
  }

  const tokens = getRequestCookies(resp);

  if (!tokens.laravelToken) {
    throw new Error('Failed to get laravel_token from BarChart response cookie');
  }

  if (!tokens.xsrfToken) {
    throw new Error('Failed to get XSRF-TOKEN from BarChart response cookie');
  }

  console.debug(`x-xsrf-token`, tokens.xsrfToken);
  console.debug(`cookie`, `laravel_token=${encodeURIComponent(tokens.laravelToken)}`);

  return tokens;
}

async function getBarChartGuestAccess() {
  const url = `https://www.barchart.com/options/unusual-activity/stocks`;
  const resp = await fetch(url);
  console.debug('barchart poke request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }

  if (!/^2/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed to poke BarChart (${resp.stastus}: ${resp.text()})`);
  }

  const tokens = getRequestCookies(resp);

  if (!tokens.laravelToken) {
    throw new Error('Failed to get laravel_token from BarChart response cookie');
  }

  if (!tokens.xsrfToken) {
    throw new Error('Failed to get XSRF-TOKEN from BarChart response cookie');
  }

  console.debug(`x-xsrf-token`, tokens.xsrfToken);
  console.debug(`cookie`, `laravel_token=${encodeURIComponent(tokens.laravelToken)}`);

  return tokens;
}

async function getData(tokens, type: 'stock' | 'etf' | 'index', page = 1) {
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
  const queryParams = queryString.stringify(query);
  const url = `https://www.barchart.com/proxies/core-api/v1/options/get?${queryParams}`;

  const { xsrfToken, laravelToken } = tokens;
  const options = {
    method: 'GET',
    headers: {
      'x-xsrf-token': xsrfToken,
      cookie: `laravel_token=${encodeURIComponent(laravelToken)}`,
    }
  }

  console.debug(`barchart request for ${type}`.bgMagenta.white, url.magenta);

  const resp = await fetch(url, options);
  if (!/^2/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    throw new Error(`Failed response from BarChart (${resp.status}: ${await resp.text()})`);
  }
  const respBody = await resp.json();
  const { count, total, data } = respBody;

  console.debug('response count:', count, 'total:', total);

  return { count, total, page, data };
}

async function getDataByType(tokens, type: 'stock' | 'etf' | 'index') {
  const allData = [];

  let page = 1;
  let totalReceived = 0;
  while (true) {
    const { count, total, data } = await getData(tokens, type, page);
    totalReceived += count;
    allData.push(...data);
    page++;
    if (totalReceived >= total) {
      break;
    }
  }

  return allData;
}

export async function getAllUnusualOptionActivity(type) {
  const tokens = await getBarChartGuestAccess();

  const data = await getDataByType(tokens, type);
  return data;

  // const stocks = await getDataByType(tokens, 'stock');
  // const etfs = await getDataByType(tokens, 'etf');
  // const indices = await getDataByType(tokens, 'index');

  // return {
  //   stocks,
  //   etfs,
  //   indices,
  // }
}

export async function getOptionPutCallHistory(type) {
  const tokens = await getBarChartAccessByLogin('dayaozi666@gmail.com', '198361124');

  throw new Error('Not implemented');
}