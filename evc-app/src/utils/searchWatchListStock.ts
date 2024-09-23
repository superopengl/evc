import { getManager, getRepository } from 'typeorm';
import { StockSearchParams } from '../types/StockSearchParams';
import { assert } from './assert';
import { StockWatchList } from '../entity/StockWatchList';
import { StockLatestPaidInformation } from '../entity/views/StockLatestPaidInformation';
import { Stock } from '../entity/Stock';
import _ from 'lodash';
import { StockWatchListWithCustomTags } from '../entity/views/StockWatchListWithCustomTags';

export async function searchWatchListStock(userId: string, tags: string[]) {
  assert(userId, 500, 'userId is required');

  let query = getManager()
    .createQueryBuilder()
    .from(StockLatestPaidInformation, 's')
    .innerJoin(q => q
      .from(StockWatchListWithCustomTags, 'sw')
      .where('sw."userId" = :userId', { userId }),
      'sw',
      'sw.symbol = s.symbol')
    .where('1 = 1');

  if (tags?.length) {
    // Filter by tags
    query = query.andWhere('(sw.tags && array[:...tags]::uuid[]) IS TRUE', { tags });
  }

  query = query.select('s.*')
    .addSelect('TRUE as watched')
    .addSelect('sw.belled as belled')
    .addSelect('sw.tags as tags')
    .orderBy('s.symbol')

  const data = await query.execute();

  return {
    data
  };
}
