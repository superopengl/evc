import * as iex from 'iexcloud_api_wrapper';
import { getManager } from 'typeorm';
import errorToJson from 'error-to-json';
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

export const execute = async () => {
  try {
    const stocks = await iex.sse();
    console.log('Task', 'sync_all_symbols', 'iex.marketSymbols', stocks.length);
    const result = await updateDatabase(stocks);
    console.log('Task', 'sync_all_symbols', 'database', JSON.stringify(result));
  } catch (e) {
    console.error('Task', 'sync_all_symbols', 'failed', errorToJson(e));
  }
}