import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';
import * as stockEpsService from '../services/stockEpsService';
import * as moment from 'moment';
import { refreshMaterializedView } from '../db';
import { executeWithDataEvents } from '../services/dataLogService';

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
  entity.value = value;
  entity.source = 'manual';

  await getRepository(StockEps).insert(entity);

  await executeWithDataEvents('refresh materialized views', 'ui save eps', refreshMaterializedView);

  res.json();
});

export const deleteStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol, reportDate } = req.params;
  await getRepository(StockEps).delete({
    symbol,
    reportDate
  });

  await executeWithDataEvents('refresh materialized views', 'ui delete eps', refreshMaterializedView);

  res.json();
});

export const syncStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { symbol } = req.params;
  await stockEpsService.syncStockEps(symbol);
  res.json();
});

