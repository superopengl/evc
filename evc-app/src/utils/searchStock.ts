import { getManager, getRepository } from 'typeorm';
import { StockSearchParams } from '../types/StockSearchParams';
import { assert } from './assert';
import { StockWatchList } from '../entity/StockWatchList';
import { StockLatestPaidInformation } from '../entity/views/StockLatestPaidInformation';
import { Stock } from '../entity/Stock';
import * as _ from 'lodash';

const demoSymbols = [
  'AAPL',
  'AMZN',
  'TSLA',
  'NIO',
  'TSM',
  'OXY',
  'AMD',
  'COST',
  'DIS',
  'WFC',
  'BA',
  'AAL'
];
const orderMap = new Map(demoSymbols.map((s, i) => [s, i]));

export async function searchStockForGuest(queryInfo: StockSearchParams) {
  const pageNo = 1;
  const pageSize = 12;

  let query = getManager()
    .createQueryBuilder()
    .from(StockLatestPaidInformation, 's')

  const count = await query.getCount();
  const result = await query
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .where(`symbol IN (:...symbols)`, { symbols: demoSymbols })
    .select([
      `s.symbol as symbol`,
      `s.company as company`,
      `s."lastPrice" as "lastPrice"`,
      `s."isUnder" as "isUnder"`,
      `s."isOver" as "isOver"`,
    ])
    .execute();

  const data = _.sortBy(result, x => orderMap.get(x.symbol));

  return {
    count,
    page: pageNo,
    data
  };
}

export async function searchStock(queryInfo: StockSearchParams, includesWatchForUserId?: string) {
  const { symbols, tags, page, size, watchOnly, noCount, overValued, underValued, inValued } = queryInfo;

  const pageNo = +page || 1;
  const pageSize = +size || 60;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getManager()
    .createQueryBuilder()
    .from(StockLatestPaidInformation, 's')
    .where('1 = 1');

  if (symbols?.length) {
    query = query.andWhere('s.symbol IN (:...symbols)', { symbols: symbols.map(s => s.toUpperCase()) });
  }
  // if (text) {
  //   query = query.andWhere('s.symbol ILIKE :text OR s.company ILIKE :text', { text: `%${text}%` });
  //   pageNo = 1;
  // }

  let includesWatch = false;
  if (includesWatchForUserId) {
    includesWatch = true;
    const userId = includesWatchForUserId;
    if (watchOnly) {
      query = query.innerJoin(q => q.from(StockWatchList, 'sw')
        .where('sw."userId" = :userId', { userId }),
        'sw',
        'sw.symbol = s.symbol');
    } else {
      query = query.leftJoin(q => q.from(StockWatchList, 'sw')
        .where('sw."userId" = :userId', { userId }),
        'sw',
        'sw.symbol = s.symbol');
    }
  }

  if (tags?.length) {
    // Filter by tags
    query = query.andWhere('(s.tags && array[:...tags]::uuid[]) IS TRUE', { tags });
  }

  const orClause = [];
  if (overValued) {
    orClause.push('s."isOver" IS TRUE');
  }
  if (underValued) {
    orClause.push('s."isUnder" IS TRUE');
  }
  if (inValued) {
    orClause.push('(s."isOver" IS FALSE AND s."isUnder" IS FALSE)');
  }
  if (orClause.length) {
    query = query.andWhere(`(${orClause.join(' OR ')})`);
  }

  const count = noCount ? null : await query.getCount();

  query = query.select('s.*');

  if (includesWatch) {
    query = query.addSelect('sw."createdAt" as watched')
      .addSelect('sw.belled as belled');
  }
  query = query.orderBy('s.symbol')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize);
  const data = await query.execute();

  return {
    count,
    page: pageNo,
    data
  };
}
