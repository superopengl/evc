import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
import 'colors';
import { assert } from '../utils/assert';
import * as _ from 'lodash';

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

async function singleBatchRequest(symbols: string[], datasetId: 'advanced_stats', params?: {}) {
  const len = symbols.length;
  assert(0 < len && len <= 100, 400, `Wrong size of iex batch request ${len}`);
  return await requestIexApi(`/data/core/${datasetId}/${symbols.join(',')}`, params);
}


export async function batchRequest(symbols: string[], datasetId: 'advanced_stats', batchSize = 100) {
  const result = new Map();
  for (const batchSymbols of _.chunk(symbols, batchSize)) {
    const resp = await singleBatchRequest(batchSymbols, datasetId, null);
    if (batchSymbols.length !== resp.length) {
      throw new Error(`${batchSymbols.length} symboles but the response has ${resp.length} items`);
    }
    batchSymbols.forEach((symbol, i) => {
      result.set(symbol, resp[i]);
    })
  }

  return result;
}