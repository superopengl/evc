import { getRepository } from 'typeorm';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSpecialFairValue } from '../entity/StockSpecialFairValue';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { StockHistoricalComputedFairValue } from '../entity/views/StockHistoricalComputedFairValue';
import _ from 'lodash';
import moment = require('moment');
import { refreshMaterializedView } from "../refreshMaterializedView";
import { StockComputedPe90 } from '../entity/views/StockComputedPe90';

export const getStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;

  const latestPe90: any = await getRepository(StockComputedPe90).findOne({
    where: {
      symbol
    },
    order: {
      date: 'DESC'
    }
  });

  if (latestPe90) {
    latestPe90.reportDate = latestPe90.date;
    latestPe90.isLatest = true;
  }

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

  const result = latestPe90 ? [latestPe90, ...list] : list;
  res.json(result);
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

  refreshMaterializedView().catch(() => { });

  res.json();
});

export const deleteStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockSpecialFairValue).delete(id);
  res.json();
});
