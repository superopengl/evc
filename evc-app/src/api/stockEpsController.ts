import { getRepository, getManager } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';
import {
  getNews,
  getInsiderRoster,
  getInsiderSummary,
  getInsiderTransactions,
  getMarketGainers,
  getMarketLosers,
  getMarketMostActive,
  syncStockSymbols,
  getChartIntraday,
  getChart5D,
  getEarnings
} from '../services/iexService';

export const listStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockEps).find({
    where: {
      symbol
    },
    order: {
      year: 'DESC',
      quarter: 'DESC'
    },
    take: limit
  });

  res.json(list);
});

export const saveStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { year, quarter, value } = req.body;
  const entity = new StockEps();
  Object.assign(entity, {
    symbol,
    year,
    quarter,
    value
  });

  await getRepository(StockEps).insert(entity);

  res.json();
});

export const deleteStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockEps).delete(id);
  res.json();
});

export const syncStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { symbol } = req.params;
  const earnings = await getEarnings(symbol, 4);
  const tasks = earnings.map(e => {
    const [full, quarter, year] = /Q([1-4]) ([0-9]{4})/.exec(e.fiscalPeriod);
    const entity = new StockEps();
    entity.symbol = symbol;
    entity.year = +year;
    entity.quarter = +quarter;
    entity.value = e.actualEPS;

    return getManager()
    .createQueryBuilder()
    .insert()
    .into(StockEps)
    .values(entity)
    .onConflict(`(symbol, year, quarter) DO UPDATE SET value = excluded.value`)
    .execute()
  });

  await Promise.all(tasks);
  res.json();
});

