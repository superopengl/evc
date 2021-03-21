import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSpecialFairValue } from '../entity/StockSpecialFairValue';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { compareTrend } from '../utils/compareTrend';
import { StockHistoricalComputedFairValue } from '../entity/views/StockHistoricalComputedFairValue';
import * as _ from 'lodash';
import moment = require('moment');
import { refreshMaterializedView } from '../db';

export const getStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;

  const computedList = await getRepository(StockHistoricalComputedFairValue).find({
    where: {
      symbol
    },
  });
  const specialList = await getRepository(StockSpecialFairValue).find({
    where: {
      symbol
    },
  });
  const list = _.orderBy([...computedList, ...specialList], [(item) => moment(item.reportDate).toDate()], ['desc']);

  res.json(list);
});

export const saveStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { reportDate, lo, hi } = normalizeLoHiValues(req.body, true);
  const repo = getRepository(StockSpecialFairValue);

  const entity = new StockSpecialFairValue();
  entity.symbol = symbol;
  entity.reportDate = reportDate;
  entity.fairValueLo = lo;
  entity.fairValueHi = hi;

  await repo.insert(entity);

  refreshMaterializedView().catch(() => {});

  res.json();
});

export const deleteStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockSpecialFairValue).softDelete(id);
  res.json();
});
