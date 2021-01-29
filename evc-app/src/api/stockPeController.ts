import { getRepository } from 'typeorm';
import { StockPe } from '../entity/StockPe';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { v4 as uuidv4 } from 'uuid';
import { compareTrend } from '../utils/compareTrend';
import { StockAllFairValue } from '../entity/views/StockAllFairValue';


export const listStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockPe).find({
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

export const saveStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { lo, hi } = normalizeLoHiValues(req.body);
  const repo = getRepository(StockPe);
  const pre = await repo.findOne({
    where: {
      symbol
    },
    order: {
      date: 'DESC'
    }
  })
  const entity = new StockPe();
  entity.id = uuidv4();
  entity.symbol = symbol;
  entity.author = userId;
  entity.lo = lo;
  entity.hi = hi;

  await repo.insert(entity);

  res.json();
});


export const deleteStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockPe).delete(id);
  res.json();
});
