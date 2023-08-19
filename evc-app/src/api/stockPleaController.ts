
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
import { StockLatestStockInformation } from '../entity/views/StockLatestStockInformation';
import { StockGuestPublishInformation } from '../entity/views/StockGuestPublishInformation';
import * as _ from 'lodash';
import { StockPlea } from '../entity/StockPlea';

const redisPricePublisher = new RedisRealtimePricePubService();

export const submitStockPlea = handlerWrapper((req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  getManager()
    .createQueryBuilder()
    .insert()
    .into(StockPlea)
    .values({ symbol, count: 1 })
    .onConflict(`(symbol) DO UPDATE SET count = ${getRepository(StockPlea).metadata.tableName}.count + 1`)
    .execute()
    .catch(() => { });

  res.json();
});

export const existsStockPlea = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const symbol = req.params.symbol.toUpperCase();

  await getRepository(StockPlea).softDelete(symbol);

  res.json();
});

export const listStockPleas = handlerWrapper(async (req, res) => {
  const list = await getRepository(StockPlea).find({
    order: {
      count: 'DESC'
    }
  });
  res.json(list);
});
