import { getRepository, getManager, In } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockFairValue } from '../entity/StockFairValue';
import { StockEps } from '../entity/StockEps';
import { v4 as uuidv4 } from 'uuid';
import { StockPe } from '../entity/StockPe';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { compareTrend } from '../utils/compareTrend';


export const getStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockFairValue).find({
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
  const { peId, epsIds, lo, hi, special } = normalizeLoHiValues(req.body, true);
  const repo = getRepository(StockFairValue);
  const pre = await repo.findOne({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    }
  })

  const entity = new StockFairValue();
  entity.symbol = symbol;
  entity.author = userId;
  entity.lo = lo;
  entity.hi = hi;
  entity.special = special;
  entity.epsIds = epsIds;
  entity.peId = peId;
  entity.loTrend = compareTrend(lo, pre?.lo) || pre?.loTrend;
  entity.hiTrend = compareTrend(hi, pre?.hi) || pre?.hiTrend;

  await repo.insert(entity);

  res.json();
});

export const deleteStockFairValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockFairValue).delete({ id, published: false });
  res.json();
});
