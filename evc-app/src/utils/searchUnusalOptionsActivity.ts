
import { UnusalOptionActivityEtfs } from '../entity/UnusalOptionActivityEtfs';
import { UnusalOptionActivityStock } from '../entity/UnusalOptionActivityStock';
import { UnusalOptionActivityIndex } from '../entity/UnusalOptionActivityIndex';
import { assert } from './assert';
import { getManager, getRepository } from 'typeorm';
import * as moment from 'moment';

export type UnusalOptionsActivitySearchParams = {
  symbol?: string;
  type?: 'Call' | 'Put';
  expDateFrom?: string;
  expDateTo?: string;
  timeFrom?: string;
  timeTo: string;
  page?: number;
  size?: number;
};


export async function searchUnusalOptionsActivity(entityType: 'stock' | 'etfs' | 'index', q: any, showFullData: boolean) {
  const { symbol, type, expDateFrom, expDateTo, timeFrom, timeTo, page, size } = q as UnusalOptionsActivitySearchParams;

  const entity = entityType === 'stock' ? UnusalOptionActivityStock :
    entityType === 'etfs' ? UnusalOptionActivityEtfs :
      entityType === 'index' ? UnusalOptionActivityIndex :
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
    query = query.andWhere(`time >= :c::date`, { c: timeFrom });
  }
  if (timeTo) {
    query = query.andWhere(`time <= :d::date`, { d: timeTo });
  }
  const count = await query.getCount();

  query = query.orderBy('time', 'DESC')
    .addOrderBy('symbol')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize);

  if(showFullData) {
    query = query.select('*')
  } else {
    query = query.select([
      'id',
      'symbol',
      'time',
      'price',
      'type',
      'dte',
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



