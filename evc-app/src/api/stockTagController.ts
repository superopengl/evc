
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { StockTag } from '../entity/StockTag';
import { Role } from '../types/Role';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
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
  // assertRole(req, 'member', 'admin', 'agent', 'free');
  const role = (req as any).user?.role;
  const isAdminOrAgent = [Role.Admin, Role.Agent].includes(role);
  const query = isAdminOrAgent ? {} : { where: { officialOnly: false } };
  const list = await getRepository(StockTag).find({
    ...query,
    order: {
      sortGroup: 'ASC',
      name: 'ASC'
    }
  });
  if (!isAdminOrAgent) {
    res.set('Cache-Control', `public, max-age=3600`);
  }
  res.json(list);
});

export const deleteStockTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockTag).delete({
    id,
    builtIn: false
  });
  res.json();
});