import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { start } from './jobStarter';
import { executeSqlStatement } from './executeSqlStatement';

start('sync_all_symbols', async () => {
  const stocks = await iex.marketSymbols();
  await executeSqlStatement(stocks, stock => {
    const { symbol, name } = stock;
    const companyName = name || `Company of ${symbol}`;
    return `INSERT INTO public.stock(symbol, company) VALUES ('${symbol}', '${companyName}') ON CONFLICT (symbol) DO UPDATE SET company = '${companyName}'`;
  });
});