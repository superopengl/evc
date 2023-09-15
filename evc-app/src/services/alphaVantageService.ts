import * as alphavantage from 'alphavantage';
import * as queryString from 'query-string';
import * as _ from 'lodash';
import * as fetch from 'node-fetch';

// const alphaApi = alphavantage({key: process.env.ALPHAVANTAGE_API_KEY});

export async function getEarnings(symbol: string, howManyQuarters = 4) {
  const resp = await requestAlphaVantageApi({
    function: 'EARNINGS',
    symbol,
  });
  const quarterlyEarnings = resp?.quarterlyEarnings || [];
  const result = _.chain(quarterlyEarnings)
    .filter(x => _.isFinite(+(x.reportedEPS)))
    .take(howManyQuarters)
    .value();
  return result;
}

async function requestAlphaVantageApi(query?: object) {
  const queryParams = queryString.stringify({
    ...query,
    apikey: process.env.ALPHAVANTAGE_API_KEY
  });
  const url = `${process.env.ALPHAVANTAGE_API_ENDPOINT}/query?${queryParams}`;
  const resp = await fetch(url, query);
  console.debug('alphavantage request'.bgMagenta.white, resp.status, url.magenta);
  if (/^4/.test(`${resp.status}`)) {
    // 429 Too Many Requests
    // 404 Sandbox doesn't return data
    return null;
  }
  return resp.json();
}