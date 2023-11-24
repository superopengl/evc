import { getRepository, getManager } from 'typeorm';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { StockWatchList } from '../entity/StockWatchList';
import { searchStock } from '../utils/searchStock';
import _ from 'lodash';
import { StockUserCustomTag } from '../entity/StockUserCustomTag';
import { assert } from '../utils/assert';
import { searchWatchListStock } from '../utils/searchWatchListStock';

export const getWatchList = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const { user: { id: userId } } = req as any;
  const { tags } = req.body;

  const list = await searchWatchListStock(userId, tags);

  res.json(list);
});

export const watchStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).insert({ userId, symbol });
  res.json();
});

export const unwatchStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).delete({ userId, symbol });
  res.json();
});

export const bellStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).update({ userId, symbol }, { belled: true });
  res.json();
});

export const unbellStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).update({ userId, symbol }, { belled: false });
  res.json();
});

export const saveStockCustomTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  const { tags } = req.body;
  const sw = await getRepository(StockWatchList).findOne({ userId, symbol }, { relations: ['tags'] });
  assert(sw, 404);
  if (sw) {
    sw.tags = tags?.length ? await getRepository(StockUserCustomTag).findByIds(tags) : null;
    await getManager().save(sw);
  }

  res.json();
});

export const listStockCustomTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const { user: { id: userId } } = req as any;
  const list = await getRepository(StockUserCustomTag).find({
    where: {
      userId
    },
    select: [
      'id',
      'name',
    ],
    order: {
      name: 'ASC'
    }
  });
  res.json(list);
});

export const createStockCustomTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const { user: { id: userId } } = req as any;
  const { name } = req.body;
  const tagName = name?.trim() || '';
  assert(tagName && tagName.length <= 16, 400, 'Custom tag name cannot exceed 16 characters');
  const result = await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockUserCustomTag)
    .values({
      userId,
      name
    })
    .orIgnore()
    .returning('id')
    .execute();

  const tagId = result.raw[0]?.id;
  res.json(tagId);
});

export const deleteStockCustomTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;
  await getRepository(StockUserCustomTag).delete({ id, userId });
  res.json();
});