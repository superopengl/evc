import moment = require('moment');
import { getManager } from 'typeorm';
import { StockEps } from '../entity/StockEps';
import { getEarnings } from './alphaVantageService';
import * as _ from 'lodash';

type StockIexEpsInfo = {
  symbol: string;
  reportDate: string;
  value: number;
};

export const syncStockEps = async (symbol: string, howManyQuarters = 8) => {
  const earnings = await getEarnings(symbol, howManyQuarters);
  if (!earnings?.length) {
    console.log('Nothing returned form API for ', symbol);
    return;
  }
  const infoList = _.chain(earnings)
    .map(e => {
      const data: StockIexEpsInfo = {
        symbol,
        reportDate: e.reportedDate,
        value: e.reportedEPS,
      };

      return data;
    })
    .uniqBy(e => `${e.symbol}.${e.reportDate}`)
    .value();

  await syncManyStockEps(infoList);
};

export async function syncManyStockEps(epsInfo: StockIexEpsInfo[]) {
  const entites = epsInfo.map(item => {
    const { symbol, reportDate, value: value } = item;

    const entity = new StockEps();
    entity.symbol = symbol;
    entity.reportDate = reportDate;
    entity.value = value;
    return entity;
  }).filter(x => !!x);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockEps)
    .values(entites)
    .onConflict('(symbol, "reportDate") DO UPDATE SET value = excluded.value')
    .execute();
};