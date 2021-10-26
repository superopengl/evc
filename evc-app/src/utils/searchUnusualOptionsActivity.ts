
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
  order?: { field: string, order: 'ASC' | 'DESC' }[];
  lastDayOnly: boolean;
};


export async function searchUnusualOptionsActivity(entityType: 'stock' | 'etfs' | 'index', q: any, showFullData: boolean) {
  const { symbol, type, expDateFrom, expDateTo, timeFrom, timeTo, page, size, order, lastDayOnly } = q as UnusualOptionsActivitySearchParams;

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

  if (lastDayOnly) {
    const { tableName, schema } = getRepository(entity).metadata;
    query = query.andWhere(`"tradeDate" = (select max("tradeDate") from "${schema}"."${tableName}")`);
  } else {
    if (timeFrom) {
      query = query.andWhere(`"tradeDate" >= :c::date`, { c: timeFrom });
    }
    if (timeTo) {
      query = query.andWhere(`"tradeDate" <= :d::date`, { d: timeTo });
    }
  }

  const count = await query.getCount();

  const orderConditions: { field: string, order: 'ASC' | 'DESC' }[] = order?.length ? order : [
    { field: 'tradeDate', order: 'DESC' },
    { field: 'symbol', order: 'ASC' },
  ]

  for (const orderCond of orderConditions) {
    const { field, order } = orderCond;
    query = query.addOrderBy(`"${field}"`, order);
  }

  query = query.offset((pageNo - 1) * pageSize)
    .limit(pageSize);

  if (showFullData) {
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



