import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSupport } from '../entity/StockSupport';


export const listStockSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockSupport).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    },
    relations: [
      'publish'
    ],
    take: limit
  });

  res.json(list);
});

export const saveStockSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { lo, hi } = req.body;
  const entity = new StockSupport();
  Object.assign(entity, {
    symbol,
    author: userId,
    lo,
    hi
  });

  await getRepository(StockSupport).insert(entity);

  res.json();
});

export const deleteStockSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockSupport).delete(id);
  res.json();
});
