
import { getManager, getRepository, Like, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { StockHistory } from '../entity/StockHistory';
import * as moment from 'moment';
import { StockSearch } from '../entity/StockSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { StockWatchList } from '../entity/StockWatchList';
import { StockTag } from '../entity/StockTag';

async function publishStock(stock) {

}

export const incrementStock = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const { user } = req as any;

  const stock = await getRepository(Stock).findOne(symbol);
  assert(stock, 404);

  const entity = new StockSearch();
  entity.symbol = symbol;
  entity.by = user?.id;
  entity.ipAddress = req.ip;
  entity.location = geoip.lookup(req.ip);
  entity.userAgent = uaParser(req.headers['user-agent']);

  try {
    await getRepository(StockSearch).insert(entity);
  } catch (err) {
    logError(err, req, null);
  }

  res.json();
});

export const getStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id: userId } } = req as any;
  const { symbol } = req.params;

  const repo = getRepository(Stock);
  const stock = await repo.findOne(symbol, {relations: ['tags']});
  assert(stock, 404);

  res.json(stock);
});

export const getStockHistory = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;

  const list = await getRepository(StockHistory).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    }
  });
  assert(list.length, 404);

  res.json(list);
});

export const getWatchList = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id: userId } } = req as any;
  const list = await getRepository(Stock)
    .createQueryBuilder('s')
    .innerJoin(
      q => q.from(StockWatchList, 'w').where(`w."userId" = :userId`, { userId }),
      'w',
      `s.symbol = w.symbol`
    )
    .getMany();

  res.json(list);
});

export const watchStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).insert({ userId, symbol });
  res.json();
});

export const unwatchStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).delete({ userId, symbol });
  res.json();
});

export const listStock = handlerWrapper(async (req, res) => {
  const list = await getRepository(Stock).find({ select: ['symbol', 'company'] });

  res.json(list);
});

export const listHotStock = handlerWrapper(async (req, res) => {
  const { size } = req.query;
  const limit = +size || 10;

  const cacheKey = 'hotStockList';
  let list = getCache(cacheKey);
  if (!list) {
    list = await getManager()
      .createQueryBuilder()
      .from(Stock, 's')
      .innerJoin(q => q.from(StockSearch, 'h')
        .select('h.symbol, COUNT(1) AS count')
        .groupBy('h.symbol')
        .orderBy('count', 'DESC'), 'h', `s.symbol = h.symbol`
      )
      .select('*')
      .limit(limit)
      .execute();
    setCache(cacheKey, list, 1);
  }

  res.json(list);
});

export const searchStock = handlerWrapper(async (req, res) => {
  // assertRole(req, 'admin', 'agent', 'client');
  const { text, history, from, to, page, size } = req.body;

  assert(page >= 0 && size > 0, 400, 'Invalid page and size parameter');
  const pagenation = {
    skip: page * size,
    limit: size,
  };

  let query = getManager()
    .createQueryBuilder()
    .from(history ? StockHistory : Stock, 's')
    .where('1 = 1');
  if (text) {
    query = query.andWhere('s.symbol ILIKE :text OR s.company ILIKE :text', { text: `%${text}%` });
  }
  if (from) {
    query = query.andWhere('s."createdAt" >= :date', { data: moment(from).toDate() });
  }
  if (to) {
    query = query.andWhere('s."createdAt" <= :date', { data: moment(to).toDate() });
  }
  query = query.orderBy('symbol')
    .addOrderBy('"createdAt"', 'DESC')
    .offset(pagenation.skip)
    .limit(pagenation.limit);

  const list = await query.execute();
  res.json(list);
});

export const saveStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id: userId } } = req as any;
  const stock = new Stock();
  const {tags, ...other} = req.body;

  Object.assign(stock, other);
  stock.symbol = stock.symbol.toUpperCase();
  stock.by = userId;
  stock.tags = await getRepository(StockTag).find({id: In(tags)});

  const repo = getRepository(Stock);
  await repo.save(stock);

  res.json();
});

export const deleteStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { symbol } = req.params;
  const repo = getRepository(Stock);
  await repo.delete(symbol);
  res.json();
});


