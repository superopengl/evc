import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSpecialFairValue } from '../entity/StockSpecialFairValue';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { compareTrend } from '../utils/compareTrend';
import { StockAllFairValue } from '../entity/views/StockAllFairValue';


export const getStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockAllFairValue).find({
    where: {
      symbol
    },
    order: {
      date: 'DESC'
    },
    take: limit
  });

  res.json(list);
});

export const saveStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { date, lo, hi } = normalizeLoHiValues(req.body, true);
  const repo = getRepository(StockSpecialFairValue);

  const entity = new StockSpecialFairValue();
  entity.symbol = symbol;
  entity.date = date;
  entity.author = userId;
  entity.fairValueLo = lo;
  entity.fairValueHi = hi;

  await repo.insert(entity);

  res.json();
});

export const deleteStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockSpecialFairValue).softDelete(id);
  res.json();
});
