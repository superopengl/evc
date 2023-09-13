
import { UnusalOptionActivityEtfs } from '../entity/UnusalOptionActivityEtfs';
import { UnusalOptionActivityStocks } from '../entity/UnusalOptionActivityStocks';
import { UnusalOptionActivityIndices } from '../entity/UnusalOptionActivityIndices';
import { assert } from './assert';
import { getManager } from 'typeorm';

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


export async function searchUnusalOptionsActivity(entityType: 'stocks' | 'etfs' | 'indices', q: any) {
  const { symbol, type, expDateFrom, expDateTo, timeFrom, timeTo, page, size } = q as UnusalOptionsActivitySearchParams;

  const entity = entityType === 'stocks' ? UnusalOptionActivityStocks :
    entityType === 'etfs' ? UnusalOptionActivityEtfs :
      entityType === 'indices' ? UnusalOptionActivityIndices :
        null;
  assert(entity, 400, `Unsupported type ${entityType}`);
  const pageNo = +page || 1;
  const pageSize = +size || 60;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getManager()
    .createQueryBuilder()
    .from(entity, 's')
    .where('1 = 1');

  if (symbol) {
    query = query.andWhere(`symbol = :symbol`, { symbol: symbol.toUpperCase() });
  }
  if (type) {
    query = query.andWhere(`type = :type`, { type });
  }
  if (expDateFrom) {
    query = query.andWhere(`"expDate" >= :date`, { date: expDateFrom });
  }
  if (expDateTo) {
    query = query.andWhere(`"expDate" <= :date`, { date: expDateTo });
  }
  if (timeFrom) {
    query = query.andWhere(`time >= :date`, { date: timeFrom });
  }
  if (timeTo) {
    query = query.andWhere(`time <= :date`, { date: timeTo });
  }
  const count = await query.getCount();

  query = query.orderBy('time', 'DESC')
    .addOrderBy('symbol')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize);
  const data = await query.execute();

  return {
    count,
    page: pageNo,
    data
  };
}



