
import { UnusualOptionActivityEtfs } from '../entity/UnusualOptionActivityEtfs';
import { UnusualOptionActivityStock } from '../entity/UnusualOptionActivityStock';
import { UnusualOptionActivityIndex } from '../entity/UnusualOptionActivityIndex';
import { assert } from './assert';
import { getManager, getRepository } from 'typeorm';
import moment from 'moment';
import { OptionPutCallHistoryInformation } from '../entity/views/OptionPutCallHistoryInformation';

export type UnusualOptionsActivitySearchParams = {
  symbol?: string;
  timeFrom?: string;
  timeTo: string;
  page?: number;
  size?: number;
  order?: { field: string, order: 'ASC' | 'DESC' }[];
  lastDayOnly: boolean;
};


export async function searchOptionPutCallHistory(type, q: any, showFullData: boolean) {
  const { symbol, timeFrom, timeTo, page, size, order, lastDayOnly } = q as UnusualOptionsActivitySearchParams;

  const pageNo = +page || 1;
  const pageSize = +size || 60;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(OptionPutCallHistoryInformation)
    .createQueryBuilder()
    .where(`type = :type`, { type });

  const symbolsResult = await getRepository(OptionPutCallHistoryInformation)
    .createQueryBuilder()
    .where('type = :type', { type })
    .select('symbol')
    .distinct(true)
    .orderBy('symbol')
    .execute();

  const symbols = symbolsResult.map(x => x.symbol);

  if (symbol) {
    query = query.andWhere(`symbol = :symbol`, { symbol: symbol.toUpperCase() });
  }

  if (lastDayOnly) {
    const { tableName, schema } = getRepository(OptionPutCallHistoryInformation).metadata;
    query = query.andWhere(`"date" = (select max("date") from "${schema}"."${tableName}")`);
  } else {
    if (timeFrom) {
      query = query.andWhere(`"date" >= :c::date`, { c: timeFrom });
    }
    if (timeTo) {
      query = query.andWhere(`"date" <= :d::date`, { d: timeTo });
    }
  }

  const count = await query.getCount();

  const orderConditions: { field: string, order: 'ASC' | 'DESC' }[] = order?.length ? order : [
    { field: 'symbol', order: 'ASC' },
    { field: 'date', order: 'DESC' },
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
      'row_number() over (order by "date" desc, symbol) as id',
      'symbol',
      '"date"',
      'name',
      // '"putCallVol"',
      '"todayOptionVol"',
      '"putCallOIRatio"',
      '"totalOpenInterest"',
      '"todayPercentPutVol"',
      '"todayPercentCallVol"',
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



