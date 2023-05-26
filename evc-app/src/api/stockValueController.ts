import { getRepository, getManager, In } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockValue } from '../entity/StockValue';
import { StockEps } from '../entity/StockEps';
import { v4 as uuidv4 } from 'uuid';
import { StockPe } from '../entity/StockPe';


export const getStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockValue).find({
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

export const saveStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { peId, epsIds, lo, hi, special } = req.body;

  const fairValue = new StockValue();
  fairValue.symbol = symbol;
  fairValue.author = userId;
  fairValue.lo = lo;
  fairValue.hi = hi;
  fairValue.special = special;
  fairValue.epsIds = epsIds;
  fairValue.peId = peId;

  await getRepository(StockValue).insert(fairValue);

  res.json();
});

export const deleteStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockValue).delete(id);
  res.json();
});
