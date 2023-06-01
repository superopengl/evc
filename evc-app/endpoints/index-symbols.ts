import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';

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

export const start = async () => {
  let connection: Connection = null;
  try {
    connection = await connectDatabase();
    const stocks = await iex.marketSymbols();
    console.log('Task', 'sync_all_symbols', 'iex.marketSymbols', stocks.length);
    await updateDatabase(stocks);
    console.log('Task', 'sync_all_symbols', 'done');
  } catch (e) {
    console.error('Task', 'sync_all_symbols', 'failed', errorToJson(e));
  } finally {
      connection?.close();
  }
};
