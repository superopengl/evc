import { getRepository, getManager } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';
import * as stockEpsService from '../services/stockEpsService';
import * as moment from 'moment';
import { refreshMaterializedView } from '../db';
import { executeWithDataEvents } from '../services/dataLogService';
import { StockDailyClose } from '../entity/StockDailyClose';

export const listStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;

  const list = await getRepository(StockEps).find({
    where: {
      symbol
    },
    order: {
      reportDate: 'DESC',
    },
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

export const factorStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const symbol = req.params.symbol.toUpperCase();
  const { date, factor } = req.body;
  assert(factor > 0 && factor !== 1, 400, `Invalid factor value ${factor}`);

  const dbDateString = moment(date).format('YYYY-MM-DD');

  await getManager().transaction(async m => {
    const { schema: epsSchema, tableName: epsTableName } = getRepository(StockEps).metadata;
    await m.query(
      `UPDATE "${epsSchema}"."${epsTableName}" SET value = value * $1 WHERE symbol = $2 AND "reportDate" < $3`,
      [factor, symbol, dbDateString]
    );

    const { schema: closeSchema, tableName: closeTableName } = getRepository(StockDailyClose).metadata;
    await m.query(
      `UPDATE "${closeSchema}"."${closeTableName}" SET close = close * $1 WHERE symbol = $2 AND date < $3`,
      [factor, symbol, dbDateString]
    );
  })
  res.json();
});

