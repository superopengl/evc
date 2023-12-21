import { getRepository, getManager } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
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

export const factorStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { symbol } = req.params;
  const { factor } = req.body;
  assert(factor > 0 && factor !== 1, 400, `Invalid factor value ${factor}`);

  const { schema, tableName } = getRepository(StockEps).metadata;
  await getManager()
    .query(
      `UPDATE "${schema}"."${tableName}" SET value = value * $2 WHERE symbol = $1`,
      [symbol.toUpperCase(), factor]
    );

  res.json();
});

