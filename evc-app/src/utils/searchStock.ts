import { getManager } from 'typeorm';
import { StockSearchParams } from '../types/StockSearchParams';
import { assert } from './assert';
import { StockWatchList } from '../entity/StockWatchList';
import { StockLatestStockInformation } from '../entity/views/StockLatestStockInformation';

export async function searchStock(queryInfo: StockSearchParams, includesWatchForUserId?: string) {
  const { symbols, tags, page, size, watchOnly, noCount, overValued, underValued, inValued } = queryInfo;

  const pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getManager()
    .createQueryBuilder()
    .from(StockLatestStockInformation, 's')
    .where('1 = 1');

  if (symbols?.length) {
    query = query.andWhere(`s.symbol IN (:...symbols)`, { symbols: symbols.map(s => s.toUpperCase()) });
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
    query = query.andWhere(`(s.tags && array[:...tags]::uuid[]) IS TRUE`, { tags });
  }

  const orClause = [];
  if (overValued) {
    orClause.push(`s."isOver" IS TRUE`);
  }
  if (underValued) {
    orClause.push(`s."isUnder" IS TRUE`);
  }
  if (inValued) {
    orClause.push(`(s."isOver" IS FALSE AND s."isUnder" IS FALSE)`);
  }
  if(orClause.length) {
    query = query.andWhere(`(${orClause.join(' OR ')})`);
  }

  const count = noCount ? null : await query.getCount();

  query = query.select('s.*');

  if (includesWatch) {
    query = query.addSelect('sw."createdAt" as watched');
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
