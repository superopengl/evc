import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSpecialFairValue } from '../entity/StockSpecialFairValue';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { compareTrend } from '../utils/compareTrend';


export const getStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockSpecialFairValue).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    },
    take: limit
  });

  res.json(list);
});

export const saveStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { lo, hi } = normalizeLoHiValues(req.body, true);
  const repo = getRepository(StockSpecialFairValue);

  const entity = new StockSpecialFairValue();
  entity.symbol = symbol;
  entity.author = userId;
  entity.fairValueLo = lo;
  entity.fairValueHi = hi;

  await repo.insert(entity);

  res.json();
});

export const deleteStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockSpecialFairValue).delete({ id, published: false });
  res.json();
});
