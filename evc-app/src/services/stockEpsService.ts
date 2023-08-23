import moment = require('moment');
import { getManager } from 'typeorm';
import { StockEps } from '../entity/StockEps';
import { getEarnings } from './iexService';

export type StockIexEpsInfo = {
  symbol: string;
  fiscalPeriod: string;
  reportDate: string;
  value: number;
};

export const syncStockEps = async (symbol: string, howManyQuarters = 4) => {
  const earnings = await getEarnings(symbol, howManyQuarters);
  if (!earnings?.length) {
    return;
  }
  const infoList = earnings.map(e => {
    const data: StockIexEpsInfo = {
      symbol,
      fiscalPeriod: e.fiscalPeriod,
      reportDate: e.EPSReportDate,
      value: e.actualEPS,
    };

    return data;
  });

  await syncManyStockEps(infoList);
};

export const syncManyStockEps = async (epsInfo: StockIexEpsInfo[]) => {
  const entites = epsInfo.map(item => {
    const { symbol, fiscalPeriod, reportDate, value: value } = item;
    const matches = /Q([1-4]) ([0-9]{4})/.exec(fiscalPeriod);
    if (!matches) {
      // Wrong fiscal period format
      return null;
    }
    const [full, quarter, year] = matches;

    const entity = new StockEps();
    entity.symbol = symbol;
    entity.year = +year;
    entity.quarter = +quarter;
    entity.reportDate = reportDate;
    entity.value = value;
    return entity;
  }).filter(x => !!x);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockEps)
    .values(entites)
    .onConflict('(symbol, "reportDate") DO NOTHING')
    .execute();
};