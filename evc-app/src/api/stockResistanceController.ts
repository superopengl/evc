import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockResistance } from '../entity/StockResistance';


export const listStockResistance = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockResistance).find({
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

export const saveStockResistance = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { lo, hi } = req.body;
  const entity = new StockResistance();
  Object.assign(entity, {
    symbol,
    author: userId,
    lo,
    hi
  });

  await getRepository(StockResistance).insert(entity);

  res.json();
});

export const deleteStockResistance = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockResistance).delete(id);
  res.json();
});
