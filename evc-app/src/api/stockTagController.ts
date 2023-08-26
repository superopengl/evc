
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { StockTag } from '../entity/StockTag';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';

export const saveStockTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const entity = new StockTag();
  Object.assign(entity, req.body);
  await getRepository(StockTag).save(entity);
  res.json();
});

export const listStockTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'client', 'admin', 'agent');
  const list = await getRepository(StockTag).find({order: {name: 'ASC'}});
  res.json(list);
});

export const deleteStockTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockTag).delete(id);
  res.json();
});