import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockValue } from '../entity/StockValue';


export const getStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;

  const list = await getRepository(StockValue).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    },
  });

  res.json(list);
});

export const saveStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const entity = new StockValue();
  Object.assign(entity, {
    ...req.body,
    symbol,
    author: userId,
  });

  await getRepository(StockValue).insert(entity);

  res.json(entity);
});

export const deleteStockValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockValue).delete(id);
  res.json();
});
