import { getManager, getRepository, In, MoreThanOrEqual } from 'typeorm';
import { Stock } from '../entity/Stock';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { StockHotSearch } from '../entity/StockHotSearch';
import { StockWatchList } from '../entity/StockWatchList';
import { StockTag } from '../entity/StockTag';
import { searchStock, searchStockForGuest } from '../utils/searchStock';
import { StockSearchParams } from '../types/StockSearchParams';
import { Role } from '../types/Role';
import { redisCache } from '../services/redisCache';
import { StockEps } from '../entity/StockEps';
import {
  getInsiderRoster,
  getQuote,
  getStockLogoUrl,
} from '../services/iexService';
import { StockLastPriceInfo } from '../types/StockLastPriceInfo';
import { StockLastPrice } from '../entity/StockLastPrice';
import { RedisRealtimePricePubService } from '../services/RedisPubSubService';
import { StockLatestPaidInformation } from '../entity/views/StockLatestPaidInformation';
import { StockLatestFreeInformation } from '../entity/views/StockLatestFreeInformation';
import { StockPlea } from '../entity/StockPlea';
import { StockPutCallRatio90 } from '../entity/views/StockPutCallRatio90';
import { StockDailyClose } from '../entity/StockDailyClose';
import { StockResistance } from '../entity/StockResistance';
import { StockSpecialFairValue } from '../entity/StockSpecialFairValue';
import { StockSupport } from '../entity/StockSupport';
import { UnusualOptionActivityEtfs } from '../entity/UnusualOptionActivityEtfs';
import { UnusualOptionActivityIndex } from '../entity/UnusualOptionActivityIndex';
import { UnusualOptionActivityStock } from '../entity/UnusualOptionActivityStock';
import { syncStockEps } from '../services/stockEpsService';
import { syncStockHistoricalClose } from '../services/stockCloseService';
import { refreshMaterializedView } from "../refreshMaterializedView";
import { StockDataInformation } from '../entity/views/StockDataInformation';
import { StockEarningsCalendar } from '../entity/StockEarningsCalendar';
import moment from 'moment-timezone';
import _ from 'lodash';
import { AUTO_ADDED_MOST_STOCK_TAG_ID } from '../utils/stockTagService';
import { getCompanyName, getNews, getTopGainersLosers } from '../services/alphaVantageService';
import { StockInsiderTransaction } from '../entity/StockInsiderTransaction';
import { syncStockLastPrice } from '../utils/syncStockLastPrice';
import { StockDailyAdvancedStat } from '../entity/StockDailyAdvancedStat';
import { OptionPutCallHistoryInformation } from '../entity/views/OptionPutCallHistoryInformation';

const redisPricePublisher = new RedisRealtimePricePubService();

export const incrementStock = handlerWrapper((req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  getManager()
    .createQueryBuilder()
    .insert()
    .into(StockHotSearch)
    .values({ symbol, count: 1 })
    .onConflict('(symbol) DO UPDATE SET count = stock_hot_search.count + 1')
    .execute()
    .catch(() => { });

  res.json();
});

export const getStockDataInfo = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const symbol = req.params.symbol.toUpperCase();

  const result = await getRepository(StockDataInformation).findOne(symbol);

  res.json(result);
});

export const getStockNextReportDate = handlerWrapper(async (req, res) => {
  // assertRole(req, 'admin', 'agent', 'member', 'free');
  const symbol = req.params.symbol.toUpperCase();

  const entity = await getRepository(StockEarningsCalendar).findOne({
    where: {
      symbol,
      reportDate: MoreThanOrEqual(moment().startOf('day').toDate())
    },
    order: {
      reportDate: 'ASC'
    }
  });

  res.set('Cache-Control', `public, max-age=3600`);
  res.json(entity?.reportDate);
});

export const getStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { user } = req as any;
  const userId = user?.id;
  const role = user?.role || Role.Guest;
  const symbol = req.params.symbol.toUpperCase();

  let stock: any;

  switch (role) {
    case Role.Admin:
    case Role.Agent: {
      stock = await getRepository(StockLatestPaidInformation).findOne({ symbol });
      break;
    }
    case Role.Member: {
      const result = await getRepository(StockLatestPaidInformation)
        .createQueryBuilder('s')
        .where('s.symbol = :symbol', { symbol })
        .leftJoin(q => q.from(StockWatchList, 'sw')
          .where('sw."userId" = :id', { id: userId }),
          'sw',
          'sw.symbol = s.symbol')
        .select('s.*')
        .addSelect('sw."createdAt" as watched')
        .addSelect('sw.belled as belled')
        .execute();
      stock = result ? result[0] : null;
      break;
    }
    case Role.Free: {
      const result = await getRepository(StockLatestFreeInformation)
        .createQueryBuilder('s')
        .where('s.symbol = :symbol', { symbol })
        .leftJoin(q => q.from(StockWatchList, 'sw')
          .where('sw."userId" = :id', { id: userId }),
          'sw',
          'sw.symbol = s.symbol')
        .select('s.*')
        .addSelect('sw."createdAt" as watched')
        .addSelect('sw.belled as belled')
        .execute();
      stock = result ? result[0] : null;
      break;
    }
    case Role.Guest: {
      // Guest user, who has no req.user
      stock = await getRepository(StockLatestFreeInformation).findOne({ symbol });
      break;
    }
    default:
      assert(false, 400, `Unsupported role ${role}`);
  }

  assert(stock, 404);

  res.json(stock);
});

export const getStockForGuest = handlerWrapper(async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  const stock = await getRepository(StockLatestFreeInformation).findOne({ symbol });

  assert(stock, 404);

  res.set('Cache-Control', `public, max-age=600`);
  res.json(stock);
});

export const existsStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { user } = req as any;
  const symbol = req.params.symbol.toUpperCase();

  const result = await getRepository(Stock).findOne(symbol);
  const exists = !!result;

  res.json(exists);
});

export const listStock = handlerWrapper(async (req, res) => {
  const list = await getRepository(Stock).find({
    select: ['symbol', 'company'],
    order: {
      symbol: 'ASC'
    }
  });

  res.set('Cache-Control', `public, max-age=600`);
  res.json(list);
});

export const listHotStock = handlerWrapper(async (req, res) => {
  const { size } = req.query;
  const limit = +size || 10;

  const list = await getRepository(StockHotSearch)
    .createQueryBuilder('h')
    .innerJoin(Stock, 's', 's.symbol = h.symbol')
    .select([
      `h.symbol as symbol`,
      `s.company as company`
    ])
    .orderBy('count', 'DESC')
    .limit(limit)
    .execute();

  res.set('Cache-Control', `public, max-age=300`);
  res.json(list);
});

export const searchStockList = handlerWrapper(async (req, res) => {
  const { user } = req as any;
  const query = req.body as StockSearchParams;
  let list: { count: number, page: number, data: any } = null;

  if (user) {
    // For logged in users
    const { id, role } = user;
    const includesWatchForUserId = role === 'member' ? id : null;

    list = await searchStock(query, includesWatchForUserId);
  } else {
    // For guest users
    list = await searchStockForGuest(query);
  }

  res.json(list);
});

const initilizedNewStockData = async (symbol) => {
  if (!symbol) {
    return;
  }
  await syncStockEps(symbol);
  await syncStockHistoricalClose(symbol, 200);
  await refreshMaterializedView();
}

async function createAndInitializeStocks(stocks: Stock[]) {
  await getManager().save(stocks);

  await syncDetailsForNewSymbols(stocks.map(s => s.symbol));
}

async function syncDetailsForNewSymbols(symbols: string[]) {
  for (const symbol of symbols) {
    try {
      console.log(`Try auto-adding stock ${symbol}`);
      await syncStockEps(symbol);
      await syncStockHistoricalClose(symbol, 200);
      await getAndFeedStockQuote(symbol);
      console.log(`Auto-added stock ${symbol} together with its EPS and its historical close prices`);
    } catch (e) {
      console.log(`Error happened when syncing details for new symbol ${symbol}`);
    }
  }

  // await refreshMaterializedView();
}

async function initlizeStocksAndGetSymbolCompanyMap(symbols: string[]): Promise<Map<string, string>> {
  const stocks = await getRepository(Stock)
    .find({
      where: {
        symbol: In(symbols)
      },
      select: [
        'symbol',
        'company'
      ]
    });

  const symbolCompanyMap = stocks.reduce((map, curr) => {
    map.set(curr.symbol, curr.company);
    return map;
  }, new Map());

  const newSymbols = _.difference(symbols, symbolCompanyMap.keys);
  if (!newSymbols.length) {
    return;
  }

  const stockTag = await getRepository(StockTag).findOne(AUTO_ADDED_MOST_STOCK_TAG_ID);
  const tags = stockTag ? [stockTag] : [];

  const newStocks = [];
  for (const symbol of newSymbols) {
    const companyName = await getCompanyName(symbol);

    const stock = new Stock();
    stock.symbol = symbol;
    stock.company = companyName;
    stock.tags = tags;
    newStocks.push(stock);

    symbolCompanyMap.set(symbol, companyName);
  }

  createAndInitializeStocks(newStocks);

  return symbolCompanyMap;
}


export const createStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id: userId } } = req as any;
  const stock = new Stock();
  const { symbol: reqSymbol, company: reqCompany, tags } = req.body;

  assert(reqSymbol, 400, 'symbol is not specified');

  const companyName = reqCompany?.trim() || await getCompanyName(reqSymbol);

  const symbol = reqSymbol.toUpperCase();

  stock.symbol = symbol;
  stock.company = companyName
  stock.logoUrl = getStockLogoUrl(symbol);
  if (tags?.length) {
    stock.tags = await getRepository(StockTag).find({
      where: {
        id: In(tags)
      }
    });
  }

  await getRepository(Stock).save(stock);

  initilizedNewStockData(symbol).catch(err => { });

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
  } else {
    stock.tags = [];
  }

  await repo.save(stock);

  res.json();
});

export const deleteStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const symbol = req.params.symbol.toUpperCase();

  const tables = [
    UnusualOptionActivityEtfs,
    UnusualOptionActivityIndex,
    UnusualOptionActivityStock,
    StockPlea,
    StockHotSearch,
    StockWatchList,
    StockSupport,
    StockResistance,
    StockDailyClose,
    StockSpecialFairValue,
    StockDailyAdvancedStat,
    StockEps,
    StockLastPrice,
    Stock,
  ];

  for (const table of tables) {
    await getRepository(table).delete({ symbol });
  }

  refreshMaterializedView().catch(() => { });

  res.json();
});

type TopsResponse = { mostActives: [], gainers: [], losers: [] };


function formatTopResponse(rawResponse, symbolCompanyMap: Map<string, string>): TopsResponse {
  const singleItemFormatter = (rawItem) => {
    return {
      symbol: rawItem.ticker,
      company: symbolCompanyMap.get(rawItem.ticker),
      latestPrice: +rawItem.price,
      change: +rawItem.change_amount,
      changePercent: +(rawItem.change_percentage.replace('%', '')) / 100,
    }
  }

  const response = {
    mostActives: rawResponse.most_actively_traded.map(singleItemFormatter),
    gainers: rawResponse.top_gainers.map(singleItemFormatter),
    losers: rawResponse.top_losers.map(singleItemFormatter)
  };

  return response;
}

const getTopsData = async (): Promise<TopsResponse> => {
  const CACHE_KEY = 'STOCK_MARKET_MOST_ACTIVITIES_TOP_GAINERS_LOSERS';
  let data = await redisCache.get(CACHE_KEY) as TopsResponse;

  if (!data) {
    const responseData = await getTopGainersLosers();
    const allSymbols = []
      .concat(responseData.top_gainers.map(x => x.ticker))
      .concat(responseData.top_losers.map(x => x.ticker))
      .concat(responseData.most_actively_traded.map(x => x.ticker));

    const symbols = Array.from(new Set(allSymbols));

    const symbolCompanyMap = await initlizeStocksAndGetSymbolCompanyMap(symbols);

    data = formatTopResponse(responseData, symbolCompanyMap);

    await redisCache.setex(CACHE_KEY, data, 300);
  }

  return data;
};

export const getMostActive = handlerWrapper(async (req, res) => {
  const data = (await getTopsData()).mostActives;
  res.set('Cache-Control', `public, max-age=300`);
  res.json(data);
});

export const getGainers = handlerWrapper(async (req, res) => {
  const data = (await getTopsData()).gainers;
  res.set('Cache-Control', `public, max-age=300`);
  res.json(data);
});

export const getLosers = handlerWrapper(async (req, res) => {
  const data = (await getTopsData()).losers;
  res.set('Cache-Control', `public, max-age=300`);
  res.json(data);
});

export const getEarningsCalendar = handlerWrapper(async (req, res) => {
  const week = +(req.query.week) ?? 0;
  console.log('query', req.query.week, 'week', week);
  const NY_TIMEZONE = 'America/New_York';
  const theWeek = moment.tz(NY_TIMEZONE).add(week, 'week');
  console.log('theWeek', theWeek.toDate());

  const data = await getRepository(Stock)
    .createQueryBuilder('s')
    .innerJoin(StockEarningsCalendar, 'c', 's.symbol = c.symbol')
    .where(`c."reportDate" BETWEEN :start AND :end`, {
      start: theWeek.startOf('week').toDate(),
      end: theWeek.endOf('week').toDate()
    })
    .orderBy(`c."reportDate"`)
    .addOrderBy(`s.symbol`)
    .select([
      `c."reportDate" as "reportDate"`,
      `s.symbol as symbol`,
      `s.company as company`,
      `s."logoUrl" as "logoUrl"`
    ])
    .execute();

  const result = _.groupBy(data, x => moment(x.reportDate).format('ddd'));

  res.set('Cache-Control', `public, max-age=1800`);
  res.json(result);
});


export const getStockInsiderTransaction = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const { symbol } = req.params;
  const result = await getRepository(StockInsiderTransaction).findOne(symbol);

  res.set('Cache-Control', `public, max-age=3600`);
  res.json(result?.value);
});

export const getStockRoster = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const result = await getInsiderRoster(symbol);
  const list = _.chain(result).orderBy(['position'], ['desc']).take(10).value();

  res.set('Cache-Control', `public, max-age=3600`);
  res.json(list);
});

export const getStockNews = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const data = await getNews(symbol);
  const formatted = data.map(x => ({
    datetime: moment(x.time_published, 'YYYYMMDDTHHmmss').toDate(),
    headline: x.title,
    summary: x.summary,
    url: x.url,
    image: x.banner_image,
  }));
  res.set('Cache-Control', `public, max-age=600`);
  res.json(formatted);
});

export const getPutCallRatioChart = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const list = await getRepository(StockPutCallRatio90).find({
    where: {
      symbol
    },
    order: {
      date: 'DESC'
    }
  })
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const getOptionPutCallHistoryChart = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const list = await getRepository(OptionPutCallHistoryInformation)
    .createQueryBuilder()
    .where(`symbol = :symbol`, { symbol })
    .select([
      '"date"',
      '"putCallOIRatio"',
      '"todayPercentPutVol"',
      '"todayPercentCallVol"',
    ])
    .distinctOn([
      'symbol',
      'date',
    ])
    .orderBy('symbol')
    .addOrderBy('date', 'ASC')
    .execute();

  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

async function updateStockLastPrice(info: StockLastPriceInfo) {
  redisPricePublisher.publish({
    type: 'price',
    data: info
  });

  const { symbol, price, change, changePercent, time } = info;
  const lastPrice = new StockLastPrice();
  lastPrice.symbol = symbol;
  lastPrice.price = price;
  lastPrice.change = change;
  lastPrice.changePercent = changePercent;

  await syncStockLastPrice(getManager(), lastPrice);
}

const getAndFeedStockQuote = async (symbol) => {
  const quote = await getQuote(symbol);
  if (quote) {
    await updateStockLastPrice({
      symbol,
      price: quote.latestPrice,
      change: quote.change,
      changePercent: quote.changePercent,
      time: quote.latestUpdate
    });
  }
  return quote;
};


export const getStockQuote = handlerWrapper(async (req, res) => {
  const { symbol } = req.params;
  const quote = await getAndFeedStockQuote(symbol);

  res.set('Cache-Control', `public, max-age=10`);
  res.json(quote);
});

export const getStockEvcInfo = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const { symbol } = req.params;
  const result = await getRepository(StockLatestPaidInformation).findOne(symbol);

  res.set('Cache-Control', `public, max-age=600`);
  res.json(result);
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
        change: quote.change,
        changePercent: quote.changePercent,
        time: quote.latestUpdate
      };

      redisCache.set(cacheKey, data);
    }
  }
  const result = {
    price: data?.price,
    time: data?.time
  };

  res.set('Cache-Control', `public, max-age=10`);
  res.json(result);
});

