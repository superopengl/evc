import { getRepository, getManager, LessThan } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';
import * as stockEpsService from '../services/stockEpsService';
import moment from 'moment';
import { refreshMaterializedView } from "../refreshMaterializedView";
import { executeWithDataEvents } from '../services/dataLogService';
import { StockDailyClose } from '../entity/StockDailyClose';
import { StockScrappedEps } from '../entity/StockScrappedEps';

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
  entity.source = 'evc';

  await getRepository(StockEps).insert(entity);

  executeWithDataEvents('refresh materialized views', 'ui save eps', refreshMaterializedView);

  res.json();
});

export const deleteStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol, reportDate } = req.params;

  let happened = false;
  await getManager().transaction(async m => {
    const entity = await m.findOne(StockEps, { symbol, reportDate });
    if (entity) {
      happened = true;

      await m.delete(StockEps, { symbol, reportDate });

      // Move it to the scrapped EPS table
      const scrapped = new StockScrappedEps();
      scrapped.symbol = entity.symbol;
      scrapped.reportDate = entity.reportDate;
      scrapped.value = entity.value;
      await m.createQueryBuilder()
        .insert()
        .into(StockScrappedEps)
        .values(scrapped)
        .orIgnore()
        .execute();
    }
  });

  if (happened) {
    executeWithDataEvents('refresh materialized views', 'ui delete eps', refreshMaterializedView);
  }

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
    // Update EPS
    await m.createQueryBuilder()
      .update(StockEps)
      .set({
        value: () => `value * ${factor}`,
        source: 'evc-factored'
      })
      .where({
        symbol,
        reportDate: LessThan(dbDateString)
      })
      .execute();

    // Update close
    await m.createQueryBuilder()
      .update(StockDailyClose)
      .set({
        close: () => `close * ${factor}`,
      })
      .where({
        symbol,
        date: LessThan(dbDateString)
      })
      .execute();

  })
  res.json();
});

