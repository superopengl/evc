
import { UnusualOptionActivityEtfs } from '../entity/UnusualOptionActivityEtfs';
import { UnusualOptionActivityStock } from '../entity/UnusualOptionActivityStock';
import { UnusualOptionActivityIndex } from '../entity/UnusualOptionActivityIndex';
import { assert } from './assert';
import { getManager, getRepository } from 'typeorm';
import * as moment from 'moment';

export type UnusualOptionsActivitySearchParams = {
  symbol?: string;
  type?: 'Call' | 'Put';
  expDateFrom?: string;
  expDateTo?: string;
  timeFrom?: string;
  timeTo: string;
  page?: number;
  size?: number;
};


export async function searchUnusualOptionsActivity(entityType: 'stock' | 'etfs' | 'index', q: any, showFullData: boolean) {
  const { symbol, type, expDateFrom, expDateTo, timeFrom, timeTo, page, size } = q as UnusualOptionsActivitySearchParams;

  const entity = entityType === 'stock' ? UnusualOptionActivityStock :
    entityType === 'etfs' ? UnusualOptionActivityEtfs :
      entityType === 'index' ? UnusualOptionActivityIndex :
        null;
  assert(entity, 400, `Unsupported type ${entityType}`);
  const pageNo = +page || 1;
  const pageSize = +size || 60;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getManager()
    .createQueryBuilder()
    .from(entity, 's')
    .where('1 = 1');

  const symbolsResult = await getManager()
    .createQueryBuilder()
    .from(entity, 's')
    .select('symbol')
    .distinct(true)
    .orderBy('symbol')
    .execute();
  const symbols = symbolsResult.map(x => x.symbol);

  if (symbol) {
    query = query.andWhere(`symbol = :symbol`, { symbol: symbol.toUpperCase() });
  }
  if (type) {
    query = query.andWhere(`type = :type`, { type });
  }
  if (expDateFrom) {
    query = query.andWhere(`"expDate" >= :a::date`, { a: expDateFrom });
  }
  if (expDateTo) {
    query = query.andWhere(`"expDate" <= :b::date`, { b: expDateTo });
  }
  if (timeFrom) {
    query = query.andWhere(`"tradeDate" >= :c::date`, { c: timeFrom });
  }
  if (timeTo) {
    query = query.andWhere(`"tradeDate" <= :d::date`, { d: timeTo });
  }
  const count = await query.getCount();

  query = query.orderBy('"tradeDate"', 'DESC')
    .addOrderBy('symbol')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize);

  if(showFullData) {
    query = query.select('*')
  } else {
    query = query.select([
      'row_number() over (order by "tradeDate" desc, symbol) as id',
      'symbol',
      '"tradeDate"',
      'price',
      'type',
      'last',
      'volume',
      '"openInt"',
      'voloi',
      'iv'
    ])
  }
  const data = await query.execute();

  return {
    count,
    page: pageNo,
    data,
    symbols
  };
}



