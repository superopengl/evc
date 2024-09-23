import fetch from 'node-fetch';
import queryString from 'query-string';
import 'colors';
import { assert } from '../utils/assert';
import _ from 'lodash';

async function requestIexApi(relativeApiPath: string, query?: object) {
  const path = relativeApiPath.replace(/^\/+|\/+$/g, '');
  const queryParams = queryString.stringify({
    ...query,
    token: process.env.IEXCLOUD_PUBLIC_KEY
  });
  const url = `${process.env.IEXCLOUD_API_ENDPOINT}/v1/${path}?${queryParams}`;
  const resp = await fetch(url, { timeout: 10000 });
  console.debug('iex request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(resp.status)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }
  return resp.json();
}

export async function sendIexRequest(symbols: string[], datasetId: 'advanced_stats' | 'insider_transactions', params?: {}) {
  const len = symbols.length;
  assert(len > 0, 500, `Wrong size of iex batch request ${len}`);
  const resp = await requestIexApi(`/data/core/${datasetId}/${symbols.join(',')}`, params);
  // assert(symbols.length === resp.length, 500, `IEX response length is not equal to symbols (${symbols.join(',')})`);

  // const map = new Map();
  // symbols.forEach((s, i) => {
  //   map.set(s, resp[i]);
  // });
  // return map;
  return resp;
}
