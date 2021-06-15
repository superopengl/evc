import { getRepository, getManager } from 'typeorm';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { StockWatchList } from '../entity/StockWatchList';
import { searchStock } from '../utils/searchStock';
import * as _ from 'lodash';
import { StockUserCustomTag } from '../entity/StockUserCustomTag';
import { assert } from '../utils/assert';

export const getWatchList = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const { user: { id: userId } } = req as any;

  const list = await searchStock({
    orderField: 'symbol',
    orderDirection: 'ASC',
    page: 1,
    size: 9999999,
    watchOnly: true,
    noCount: true,
  }, userId);

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
  const sw = await getRepository(StockWatchList).findOne(symbol);
  assert(sw, 404);
  if (sw) {
    sw.tags = tags?.length ? await getRepository(StockUserCustomTag).findByIds(tags) : [];
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
  assert(name?.trim(), 400, 'Empty custom tag name');
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockUserCustomTag)
    .values({
      userId,
      name
    })
    .orIgnore()
    .execute();
  res.json();
});

export const deleteStockCustomTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'member');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;
  await getRepository(StockUserCustomTag).delete({ id, userId });
  res.json();
});