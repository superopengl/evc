import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockEps } from '../entity/StockEps';


export const listStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockEps).find({
    where: {
      symbol
    },
    order: {
      year: 'DESC',
      quarter: 'DESC'
    },
    take: limit
  });

  res.json(list);
});

export const saveStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  const { year, quarter, value } = req.body;
  const entity = new StockEps();
  Object.assign(entity, {
    symbol,
    author: userId,
    year,
    quarter,
    value
  });

  await getRepository(StockEps).insert(entity);

  res.json(entity);
});

export const deleteStockEps = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockEps).delete(id);
  res.json();
});
