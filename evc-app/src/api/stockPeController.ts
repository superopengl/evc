import { getRepository } from 'typeorm';
import { StockPe } from '../entity/StockPe';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';


export const listStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockPe).find({
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

export const saveStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { lo, hi } = req.body;
  const entity = new StockPe();
  Object.assign(entity, {
    symbol,
    author: userId,
    lo,
    hi
  });

  await getRepository(StockPe).insert(entity);

  res.json(entity);
});


export const deleteStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockPe).delete(id);
  res.json();
});
