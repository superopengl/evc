import { getRepository, getManager } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';
import * as stockEpsService from '../services/stockEpsService';

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
  await stockEpsService.syncStockEps(symbol);
  res.json();
});

