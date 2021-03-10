import { getRepository, getManager } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';
import * as stockEpsService from '../services/stockEpsService';
import * as moment from 'moment';
import { refreshMaterializedView } from '../db';

export const listStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockEps).find({
    where: {
      symbol
    },
    order: {
      reportDate: 'DESC',
    },
    take: limit
  });

  res.json(list);
});

export const saveStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { period, value } = req.body;
  const reportDate = moment(period);
  assert(reportDate.isBefore(), 404, 'EPS report date cannot be future date');

  const entity = new StockEps();
  entity.symbol = symbol;
  entity.reportDate = reportDate.format('YYYY-MM-DD');
  entity.year = reportDate.year();
  entity.quarter = reportDate.quarter();
  entity.value = value;
  entity.source = 'manual';
  entity.author = (req as any).user.id;

  await getRepository(StockEps).insert(entity);

  refreshMaterializedView();

  res.json();
});

export const deleteStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol, reportDate } = req.params;
  await getRepository(StockEps).delete({
    symbol,
    reportDate
  });

  refreshMaterializedView();

  res.json();
});

export const syncStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { symbol } = req.params;
  await stockEpsService.syncStockEps(symbol);
  res.json();
});

