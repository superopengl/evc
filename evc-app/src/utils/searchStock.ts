import { getManager } from 'typeorm';
import { Stock } from '../entity/Stock';
import { StockPublish } from '../entity/StockPublish';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockFairValue } from '../entity/StockFairValue';
import { StockSearchParams } from '../types/StockSearchParams';
import { assert } from './assert';
import { StockWatchList } from '../entity/StockWatchList';

export async function searchStock(queryInfo: StockSearchParams, includesWatchForUserId?: string) {
  const { symbols, text, tags, page, size, orderField, orderDirection, watchOnly } = queryInfo;

  let pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getManager()
    .createQueryBuilder()
    .from(Stock, 's')
    .where('1 = 1');

  if (symbols?.length) {
    query = query.andWhere(`s.symbol IN (:...symbols)`, { symbols: symbols.map(s => s.toUpperCase()) });
  }
  if (text) {
    query = query.andWhere('s.symbol ILIKE :text OR s.company ILIKE :text', { text: `%${text}%` });
    pageNo = 1;
  }

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

  query = query
    .leftJoin(q => q.from(StockPublish, 'pu')
      .distinctOn(['pu.symbol'])
      .orderBy('pu.symbol')
      .addOrderBy('pu.createdAt', 'DESC'),
      'pu', 'pu.symbol = s.symbol');
  if (tags?.length) {
    // Filter by tags
    query = query.innerJoin(q => q.from('stock_tags_stock_tag', 'tg')
      .innerJoin(
        sq => sq.from('stock_tags_stock_tag', 'stg')
          .where(`stg."stockTagId" IN (:...tags)`, { tags }),
        'stg',
        'stg."stockSymbol" = tg."stockSymbol"'
      )
      .groupBy('tg."stockSymbol"')
      .select([
        'tg."stockSymbol" as symbol',
        'array_agg(tg."stockTagId") as tags'
      ]),
      'tag', 'tag.symbol = s.symbol');
  } else {
    query = query.leftJoin(q => q.from('stock_tags_stock_tag', 'tg')
      .groupBy('tg."stockSymbol"')
      .select([
        'tg."stockSymbol" as symbol',
        'array_agg(tg."stockTagId") as tags'
      ]),
      'tag', 'tag.symbol = s.symbol');
  }

  const count = await query.getCount();

  query = query.orderBy('s.symbol')
    .addOrderBy(`pu."${orderField || 'createdAt'}"`, orderDirection || 'DESC')
    .select([
      'pu.*',
      's.symbol as symbol',
      's.company as company',
      'tag.tags',
      'pu."createdAt" as "publishedAt"',
    ]);
  if (includesWatch) {
    query = query.addSelect('sw."createdAt" as watched');
  }
  query = query.offset((pageNo - 1) * pageSize)
    .limit(pageSize);
  const data = await query.execute();

  return {
    count,
    page: pageNo,
    data
  };
}
