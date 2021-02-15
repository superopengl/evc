import * as iex from 'iexcloud_api_wrapper';
import { Connection, getManager } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import { start } from './jobStarter';
import { executeSqlStatement } from './executeSqlStatement';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import * as tinycolor from 'tinycolor2';
import { getRepository } from 'typeorm';
import { Stock } from '../src/entity/Stock';
import { StockTag } from '../src/entity/StockTag';

const CSV_DIR_PATH = path.resolve(__dirname, 'init-stock-list');

async function feedOneStockTag(tagName: string): Promise<StockTag> {
  const repo = getRepository(StockTag);
  let tag = await repo.findOne({ name: tagName });
  if (!tag) {
    tag = new StockTag();
    tag.id = uuidv4();
    tag.name = tagName;
    tag.color = tinycolor.random().toHexString();
    await repo.insert(tag);
  }

  return tag;
}

async function feedOneStock(symbol: string, company: string, tag: StockTag): Promise<Stock> {
  const repo = getRepository(Stock);
  let stock = await repo.findOne(symbol, { relations: ['tags'] });
  if (!stock) {
    stock = new Stock();
    stock.symbol = symbol;
    stock.company = company;
    await repo.insert(stock);
  }
  stock.tags = stock.tags ?? [];
  if (stock.tags.every(t => t.name !== tag.name)) {
    stock.tags.push(tag);
    await repo.save(stock);
  }

  return stock;
}

async function parseStockDataFromFile(filePath): Promise<Array<{ symbol: string, company: string }>> {
  const stocks = [];
  const stream = fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async data => {
      const stock = {
        symbol: data.Symbol,
        company: data.Name
      };
      stocks.push(stock);
    });

  return new Promise((res, rej) => {
    stream.on('end', () => {
      res(stocks);
    }).on('error', err => {
      rej(err);
    });
  });
}


async function feedInitStockList() {
  const files = [];
  fs.readdirSync(CSV_DIR_PATH).forEach(file => {
    const filePath = path.resolve(CSV_DIR_PATH, file);
    files.push(filePath);
  });

  for (const filePath of files) {
    const tagName = path.basename(filePath, '.csv');
    const tag = await feedOneStockTag(tagName);
    const stocks = await parseStockDataFromFile(filePath);
    for (const stock of stocks) {
      await feedOneStock(stock.symbol, stock.company, tag);
    }
  }
}

start('sync_all_symbols', async () => {
  await feedInitStockList();
  process.exit();
});