
import { getManager, getRepository, Like, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import * as moment from 'moment';
import { StockSearch } from '../entity/StockSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { StockWatchList } from '../entity/StockWatchList';
import { StockTag } from '../entity/StockTag';
import { searchStock } from '../utils/searchStock';
import { StockSearchParams } from '../types/StockSearchParams';
import { Role } from '../types/Role';
import { StockPublish } from '../entity/StockPublish';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockFairValue } from '../entity/StockFairValue';
import { StockSupportLong } from '../entity/StockSupportLong';
import { StockResistanceLong } from '../entity/StockResistanceLong';
import { redisCache } from '../services/redisCache';
import { StockEps } from '../entity/StockEps';
import {
  getNews,
  getInsiderRoster,
  getInsiderSummary,
  getInsiderTransactions,
  getMarketGainers,
  getMarketLosers,
  getMarketMostActive,
  syncStockSymbols,
  getChartIntraday,
  getChart5D,
  getQuote
} from '../services/iexService';


export const incrementStock = handlerWrapper(async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
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
  const { user: { role } } = req as any;
  const symbol = req.params.symbol.toUpperCase();

  const repo = getRepository(Stock);
  const option = role === Role.Client ? {} : { relations: ['tags'] }
  const stock = await repo.findOne(symbol, option);
  assert(stock, 404);

  res.json(stock);
});


export const searchSingleStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { symbol } = req.params;

  const result = await searchStock({ symbols: [symbol] });
  const stock = result.data[0];

  assert(stock, 404);

  res.json(stock);
});

export const getStockHistory = handlerWrapper(async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  // const list = await getRepository(StockHistory).find({
  //   where: {
  //     symbol
  //   },
  //   order: {
  //     createdAt: 'DESC'
  //   }
  // });
  // assert(list.length, 404);

  res.json();
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
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).insert({ userId, symbol });
  res.json();
});

export const unwatchStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const symbol = req.params.symbol.toUpperCase();
  const { user: { id: userId } } = req as any;
  await getRepository(StockWatchList).delete({ userId, symbol });
  res.json();
});

export const listStock = handlerWrapper(async (req, res) => {
  let list = getCache('stock-list');
  if (!list) {
    list = await getRepository(Stock).find({ select: ['symbol', 'company'] }) as any;
    setCache('stock-list', list, 1200);
  }
  res.json(list);
});

export const listHotStock = handlerWrapper(async (req, res) => {
  const { size } = req.query;
  const limit = +size || 6;

  const cacheKey = 'hotStockList';
  let list = getCache(cacheKey);
  if (!list) {
    list = await getManager()
      .createQueryBuilder()
      .from(Stock, 's')
      .leftJoin(q => q.from(StockSearch, 'h')
        .select('h.symbol, COUNT(1) AS count')
        .groupBy('h.symbol'), 'h', `s.symbol = h.symbol`
      )
      .innerJoin(q => q.from(StockPublish, 'pu')
        .distinctOn(['pu.symbol'])
        .orderBy('pu.symbol')
        .addOrderBy('pu.createdAt', 'DESC'),
        'pu', 'pu.symbol = s.symbol')
      .select([
        's.*',
        'pu.*',
        'pu."createdAt" as "publishedAt"',
      ])
      .orderBy(`h.count`, 'DESC')
      .limit(limit)
      .execute();
    setCache(cacheKey, list, 1);
  }

  res.json(list);
});

export const searchStockList = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const query = req.body as StockSearchParams;

  const list = await searchStock(query);

  res.json(list);
});

export const createStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id: userId } } = req as any;
  const stock = new Stock();
  const { tags, ...other } = req.body;

  Object.assign(stock, other);
  stock.symbol = stock.symbol.toUpperCase();
  if (tags?.length) {
    stock.tags = await getRepository(StockTag).find({ id: In(tags) });
  }

  await getRepository(Stock).insert(stock);

  res.json();
});

export const updateStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id: userId } } = req as any;
  const { symbol } = req.params;
  const repo = getRepository(Stock);
  const { tags, ...other } = req.body;
  const stock = await repo.findOne(symbol.toUpperCase());

  assert(stock, 404);
  Object.assign(stock, other);
  if (tags?.length) {
    stock.tags = await getRepository(StockTag).find({ id: In(tags) });
  }

  await repo.save(stock);

  res.json();
});

export const deleteStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const symbol = req.params.symbol.toUpperCase();
  const repo = getRepository(Stock);
  await repo.delete(symbol);
  res.json();
});

export const syncStockList = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  await syncStockSymbols();
  res.json();
});

export const getMostActive = handlerWrapper(async (req, res) => {
  res.json(await getMarketMostActive());
});

export const getGainers = handlerWrapper(async (req, res) => {
  const data = await getMarketGainers();
  res.json(data);
});

export const getLosers = handlerWrapper(async (req, res) => {
  res.json(await getMarketLosers());
});

export const getStockInsider = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const [roster, summary, transactions] = await Promise.all([
    getInsiderRoster(symbol),
    getInsiderSummary(symbol),
    getInsiderTransactions(symbol)
  ]);

  res.json({
    roster,
    summary,
    transactions
  });
});

export const getStockEarningToday = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const last = await getRepository(StockEps).findOne({
    where: {
      symbol
    },
    order: {
      year: 'DESC',
      quarter: 'DESC'
    }
  })
  res.json(last);
});

export const getStockNews = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  res.json(await getNews(symbol));
});

export const getStockChartIntraday = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  res.json(await getChartIntraday(symbol));
});

export const getStockChart5D = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  res.json(await getChart5D(symbol));
});

export const getStockQuote = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  res.json(await getQuote(symbol));
});

