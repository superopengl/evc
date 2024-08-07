import fetch from 'node-fetch';
import queryString from 'query-string';
import 'colors';

async function requestIexApi(relativeApiPath: string, query?: object) {
  const path = relativeApiPath.replace(/^\/+|\/+$/g, '');
  const queryParams = queryString.stringify({
    ...query,
    token: process.env.IEXCLOUD_PUBLIC_KEY
  });
  const url = `${process.env.IEXCLOUD_API_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/${path}?${queryParams}`;
  const resp = await fetch(url, { timeout: 10000 });
  console.debug('iex request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }
  return resp.json();
}

export async function getQuote(symbol: string) {
  return await requestIexApi(`/stock/${symbol}/quote`);
}

export async function isUSMarketOpen(): Promise<boolean> {
  const result = await requestIexApi(`/stock/AAPL/quote`);
  const { isUSMarketOpen } = result;
  return !!isUSMarketOpen;
}
