import * as iex from 'iexcloud_api_wrapper';
import { getManager } from 'typeorm';
import * as fetch from 'node-fetch';

function composeSingleLine(stock) {
  const { symbol, name } = stock;
  const companyName = name || `Company of ${symbol}`;
  return `INSERT INTO public.stock(symbol, company) VALUES ('${symbol}', '${companyName}') ON CONFLICT (symbol) DO UPDATE SET company = '${companyName}'`;
}

function composeSqlStatement(stocks) {
  return stocks.map(composeSingleLine).join(';\n');
}

async function updateDatabase(stockList) {
  const sql = composeSqlStatement(stockList);
  return await getManager().query(sql);
}

async function request(relativeApiPath: string, query?: object) {
  const path = relativeApiPath.replace(/^\/+|\/+$/g, '');
  const url = `${process.env.IEXCLOUD_SSE_ENDPOINT}/${process.env.IEXCLOUD_API_VERSION}/${path}?token=${process.env.IEXCLOUD_PUBLIC_KEY}`;
  const resp = await fetch(url, query);
  return resp.json();
}

export async function syncStockSymbols() {
  const data = await request('/ref-data/symbols');
  // const stocks = await request('/ref-data/region/us/symbols');
  await updateDatabase(data);
}