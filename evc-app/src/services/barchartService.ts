import 'colors';
import moment from 'moment';
import * as puppeteer from 'puppeteer';
import { sleep } from '../utils/sleep';

/**
 * Barchart sits behind AWS WAF Bot Control. A plain HTTP client (axios, curl, ...) gets an
 * empty `202` with `x-amzn-waf-action: challenge` and no `Set-Cookie`, so the old
 * laravel_token/XSRF-TOKEN bootstrap cannot work any more, no matter what headers we send.
 *
 * Chrome solves the challenge on page load, so we open one headless page per process and
 * issue the core-api calls from inside it. The core-api itself is not challenged - it only
 * rejects requests that lack the session the challenge establishes.
 */
const BARCHART_ORIGIN = 'https://www.barchart.com';
const BARCHART_LANDING_URL = `${BARCHART_ORIGIN}/options/unusual-activity/stocks`;
// Somewhere to sit once the challenge is solved. Any same-origin document works for the
// fetches, and the landing page keeps ~250 ad/tracker requests running in the background,
// which is what wedges the renderer on a 0.5 vCPU task.
const BARCHART_PARK_URL = `${BARCHART_ORIGIN}/robots.txt`;
// Chrome's own headless UA gets challenged outright; a stock desktop UA passes.
const BARCHART_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

let sessionPromise: Promise<{ browser: puppeteer.Browser; page: puppeteer.Page }> | null = null;

// Barchart sometimes accepts a request and never answers it. Bound the fetch ourselves so a
// stalled request costs seconds, not the full protocolTimeout.
const FETCH_TIMEOUT_MS = 45 * 1000;
const FETCH_ATTEMPTS = 3;
const BROWSER_CLOSE_TIMEOUT_MS = 10 * 1000;

async function createBarchartSession() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
    // Must stay above FETCH_TIMEOUT_MS, otherwise puppeteer kills the call first and we lose
    // the page instead of just failing the one request.
    protocolTimeout: FETCH_TIMEOUT_MS + 60 * 1000
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(BARCHART_USER_AGENT);

    console.debug('barchart opening session'.bgMagenta.white, BARCHART_LANDING_URL.magenta);
    await page.goto(BARCHART_LANDING_URL, { waitUntil: 'domcontentloaded', timeout: 90 * 1000 });
    // The WAF challenge runs in the background and drops aws-waf-token once it passes.
    await page.waitForFunction(() => document.cookie.includes('aws-waf-token'), { polling: 500, timeout: 60 * 1000 });
    // Passing the challenge reloads the page, so navigate away now that the token exists: it
    // settles the execution context and drops the ad/tracker load the landing page carries.
    // Do not block those resources during the goto above - the challenge needs them to pass.
    await page.goto(BARCHART_PARK_URL, { waitUntil: 'domcontentloaded', timeout: 90 * 1000 });
    console.debug('barchart session ready'.bgMagenta.white);

    return { browser, page };
  } catch (e) {
    await browser.close();
    throw e;
  }
}

/**
 * One session is shared by every symbol in a job run. Do not move this inside the per-symbol
 * calls: re-poking the landing page thousands of times per run is what bot mitigation looks for.
 */
async function getBarchartSession() {
  if (!sessionPromise) {
    sessionPromise = createBarchartSession();
    // Let the next caller retry instead of latching onto a rejected promise forever.
    sessionPromise.catch(() => {
      sessionPromise = null;
    });
  }
  return sessionPromise;
}

export async function closeBarchartSession() {
  const pending = sessionPromise;
  sessionPromise = null;
  if (!pending) {
    return;
  }
  try {
    const { browser } = await pending;
    const proc = browser.process();
    // A wedged browser never answers Browser.close. Waiting on it would leave the old Chrome
    // alive while we start a replacement, and two Chromes on a 0.5 vCPU task starve each
    // other badly enough that even the new browser's CDP handshake times out.
    await Promise.race([browser.close().catch(() => { }), sleep(BROWSER_CLOSE_TIMEOUT_MS)]);
    if (proc && proc.exitCode === null && !proc.killed) {
      console.debug('barchart browser did not exit, killing'.bgMagenta.white);
      proc.kill('SIGKILL');
    }
  } catch {
    // Nothing useful to do if the browser is already gone.
  }
}

// No async/await inside evaluate(): tsc (target es6) would downlevel it into an `__awaiter`
// helper that does not exist in the page, and the call fails with `__awaiter is not defined`.
function fetchJsonInPage(page: puppeteer.Page, url: string, params: Record<string, any>) {
  return page.evaluate((u, p, timeoutMs) => {
    const qs = new URLSearchParams(p as Record<string, string>).toString();
    return fetch(`${u}?${qs}`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
      // Without this a request Barchart never answers hangs until puppeteer's protocolTimeout,
      // which costs minutes per symbol and takes the whole page down with it.
      signal: AbortSignal.timeout(timeoutMs)
    }).then(
      resp => resp.text().then(text => ({ status: resp.status, body: text })),
      // Report the failure instead of rejecting: a rejected evaluate is indistinguishable from
      // a dead execution context, and only the latter is worth rebuilding the browser for.
      err => ({ status: 0, body: `fetch failed: ${err && err.message ? err.message : err}` })
    );
  }, url, params, FETCH_TIMEOUT_MS);
}

async function barchartApiGet(path: string, params: Record<string, any>) {
  const url = `${BARCHART_ORIGIN}${path}`;
  let lastError: Error;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    let status;
    let body;
    try {
      ({ status, body } = await fetchJsonInPage((await getBarchartSession()).page, url, params));
    } catch (e) {
      // Barchart occasionally navigates the page under us (ad frames, challenge re-checks),
      // which tears down the execution context. Only this warrants a new browser.
      console.debug('barchart session lost, reopening'.bgMagenta.white, e.message);
      await closeBarchartSession();
      lastError = e;
      continue;
    }

    if (/^2/.test(`${status}`)) {
      return JSON.parse(body);
    }

    // 0   Timed out or network error, worth another go on the same session.
    // 429 Too Many Requests
    // 403 Session no longer accepted by the core-api - the session needs replacing.
    lastError = new Error(`Failed response from BarChart (${status}: ${(body || '').slice(0, 200)})`);
    console.debug(`barchart attempt ${attempt}/${FETCH_ATTEMPTS} failed`.bgMagenta.white, lastError.message);
    if (status === 403) {
      await closeBarchartSession();
    }
  }

  throw lastError;
}

async function grabOptionHistory(symbol, limit) {
  console.debug(`barchart request option-history for ${symbol}`.bgMagenta.white);

  const { count, total, data } = await barchartApiGet('/proxies/core-api/v1/options-historical/get', {
    symbol,
    fields: 'date,putCallVolumeRatio,totalVolume,putCallOpenInterestRatio,totalOpenInterest',
    orderBy: 'date',
    orderDir: 'desc',
    limit,
    raw: 1,
  });

  return { count, total, data };
}

async function grabOptionsData(type: 'stock' | 'etf' | 'index', page) {
  const todayString = moment().format('YYYY-MM-DD');

  console.debug(`barchart request for ${type}`.bgMagenta.white);

  const { count, total, data } = await barchartApiGet('/proxies/core-api/v1/options/get', {
    fields: 'baseSymbol,baseLastPrice,symbolType,strikePrice,expirationDate,daysToExpiration,bidPrice,midpoint,askPrice,lastPrice,volume,openInterest,volumeOpenInterestRatio,volatility,tradeTime,symbolCode',
    baseSymbolTypes: type,
    'between(volumeOpenInterestRatio,1.5,)': '',
    'between(lastPrice,.10,)': '',
    [`between(tradeTime,${todayString},)`]: '',
    'between(volume,500,)': '',
    'between(openInterest,100,)': '',
    page,
    limit: 1000
  });

  console.debug('response count:', count, 'total:', total);

  return { count, total, page, data };
}

// 1000 rows per page, and the biggest type runs to a couple of thousand rows, so this is
// only ever reached if Barchart stops honouring the `page` param.
const MAX_PAGES = 100;

async function grabDataByType(type: 'stock' | 'etf' | 'index') {
  const allData: any[] = [];

  let page = 1;
  let total = 0;

  do {
    const resp = await grabOptionsData(type, page);
    // Count the rows we actually got rather than the API's `count`: a mismatch between the
    // two is exactly the case that used to spin forever.
    const rows = resp.data ?? [];
    total = +resp.total || 0;
    allData.push(...rows);

    // The caller deletes the whole trade date before re-inserting, so returning a short read
    // would silently replace good rows with a truncated set. Fail loudly instead.
    if (!rows.length && allData.length < total) {
      throw new Error(`BarChart pagination stalled for ${type} at page ${page} (got ${allData.length} of ${total} rows)`);
    }
    if (page > MAX_PAGES) {
      throw new Error(`BarChart pagination exceeded ${MAX_PAGES} pages for ${type} (got ${allData.length} of ${total} rows)`);
    }
    page++;
  } while (allData.length < total);

  return allData;
}

export async function grabAllUnusualOptionActivity(type) {
  return await grabDataByType(type);
}

export async function grabOptionPutCallHistory(symbol, days) {
  const result = await grabOptionHistory(symbol, days);
  return result.data ?? [];
}
