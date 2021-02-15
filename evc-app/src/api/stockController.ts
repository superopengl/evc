
import { getManager, getRepository, Like, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import * as moment from 'moment';
import { StockHotSearch } from '../entity/StockHotSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { StockWatchList } from '../entity/StockWatchList';
import { StockTag } from '../entity/StockTag';
import { searchStock } from '../utils/searchStock';
import { StockSearchParams } from '../types/StockSearchParams';
import { Role } from '../types/Role';
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
  getQuote,
  getChart
} from '../services/iexService';
import { StockLastPriceInfo } from '../types/StockLastPriceInfo';
import { webhookStripe } from './stripeController';
import { StockLastPrice } from '../entity/StockLastPrice';
import { RedisRealtimePricePubService } from '../services/RedisPubSubService';
import { StockLastPublishInformation } from '../entity/views/StockLastPublishInformation';
import { StockGuestPublishInformation } from '../entity/views/StockGuestPublishInformation';
import * as _ from 'lodash';

const redisPricePublisher = new RedisRealtimePricePubService();

export const incrementStock = handlerWrapper((req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  getManager()
    .createQueryBuilder()
    .insert()
    .into(StockHotSearch)
    .values({ symbol, count: 1 })
    .onConflict(`(symbol) DO UPDATE SET count = stock_hot_search.count + 1`)
    .execute()
    .catch(() => { });

  res.json();
});

export const getStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user } = req as any;
  const { id, role } = user;
  const symbol = req.params.symbol.toUpperCase();

  let stock: any;
  const entityClass = true ? StockLastPublishInformation : StockGuestPublishInformation;

  if (role === Role.Client) {
    const result = await getRepository(entityClass)
      .createQueryBuilder('s')
      .where(`s.symbol = :symbol`, { symbol })
      .leftJoin(q => q.from(StockWatchList, 'sw')
        .where('sw."userId" = :id', { id }),
        'sw',
        'sw.symbol = s.symbol')
      .select('s.*')
      .addSelect('sw."createdAt" as watched')
      .execute();
    stock = result ? result[0] : null;
  } else {
    stock = await getRepository(entityClass).findOne({ symbol });
  }
  assert(stock, 404);

  res.json(stock);
});


export const getWatchList = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id: userId } } = req as any;
  // const list = await getRepository(Stock)
  //   .createQueryBuilder('s')
  //   .innerJoin(
  //     q => q.from(StockWatchList, 'w').where(`w."userId" = :userId`, { userId }),
  //     'w',
  //     `s.symbol = w.symbol`
  //   )
  //   .getMany();

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
  const list = await getRepository(Stock).find({
    select: ['symbol', 'company'],
    order: {
      symbol: 'ASC'
    }
  });
  res.json(list);
});

export const listHotStock = handlerWrapper(async (req, res) => {
  const { size } = req.query;
  const limit = +size || 6;

  const list = await getManager()
    .createQueryBuilder()
    .from(StockGuestPublishInformation, 'si')
    .innerJoin(q => q.from(StockHotSearch, 'h')
      .orderBy('h.count', 'DESC')
      .limit(limit), 'h', `si.symbol = h.symbol`
    )
    .where(`si."publishedAt" IS NOT NULL`)
    .orderBy('h.count', 'DESC')
    .select([
      'si.*',
    ])
    .getRawMany();

  res.json(list);
});

export const searchStockList = handlerWrapper(async (req, res) => {
  assertRole(req, 'client', 'admin', 'agent');
  const { user: { id, role } } = req as any;
  const query = req.body as StockSearchParams;
  const includesWatchForUserId = role === 'client' ? id : null;

  const list = await searchStock(query, includesWatchForUserId);

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
    stock.tags = await getRepository(StockTag).find({
      where: {
        id: In(tags)
      }
    });
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
    stock.tags = await getRepository(StockTag).find({
      where: {
        id: In(tags)
      }
    });
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
  const [roster, summary] = await Promise.all([
    getInsiderRoster(symbol),
    getInsiderTransactions(symbol)
  ]);

  res.json({
    roster: _.chain(roster).orderBy(['position'], ['desc']).take(10).value(),
    summary: summary.map(x => _.pick(x, [
      'fullName',
      'reportedTitle',
      'conversionOrExercisePrice',
      'filingDate',
      'postShares',
      'transactionCode',
      'transactionDate',
      'transactionPrice',
      'transactionShares',
      'transactionValue',
    ])),
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
  });
  res.json(last);
});

export const getStockNews = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  res.json(await getNews(symbol));
});

export const getStockChart = handlerWrapper(async (req, res) => {
  const { symbol, period, interval } = req.params;
  res.json(await getChart(symbol, period, interval));
});

async function updateStockLastPrice(info: StockLastPriceInfo) {
  redisPricePublisher.publish({
    type: 'price',
    data: info
  });

  const { symbol, price, time } = info;
  const lastPrice = new StockLastPrice();
  lastPrice.symbol = symbol;
  lastPrice.price = price;
  lastPrice.updatedAt = new Date(time);
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockLastPrice)
    .values(lastPrice)
    .onConflict(`(symbol) DO UPDATE SET price = excluded.price, "updatedAt" = excluded."updatedAt"`)
    .execute();
}

export const getStockQuote = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const quote = await getQuote(symbol);
  if (quote) {
    await updateStockLastPrice({
      symbol,
      price: quote.latestPrice,
      time: quote.latestUpdate
    });
  }
  res.json(quote);
});

export const getStockPrice = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const cacheKey = `stock.${symbol}.lastPrice`;
  let data = await redisCache.get(cacheKey) as StockLastPriceInfo;
  if (!data) {
    const quote = await getQuote(symbol);
    if (quote) {
      data = {
        price: quote.latestPrice,
        time: quote.latestUpdate
      };

      redisCache.set(cacheKey, data);
    }
  }
  const result = {
    price: data?.price,
    time: data?.time
  };
  res.json(result);
});

