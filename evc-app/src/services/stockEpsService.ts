import { getManager } from 'typeorm';
import { StockEps } from '../entity/StockEps';
import { getEarnings } from './alphaVantageService';
import * as _ from 'lodash';
import * as delay from 'delay';

type StockIexEpsInfo = {
  symbol: string;
  reportDate: string;
  value: number;
};

async function getEarningsWithThreeAttempts(symbol: string, howManyQuarters: number) {
  let earnings;
  let rawResponse;

  const attempt1 = await getEarnings(symbol, howManyQuarters);
  earnings = attempt1.earnings;
  rawResponse = attempt1.rawResponse;

  if (!earnings?.length) {
    console.log('Attempt 1: Nothing returned form API for ', symbol, JSON.stringify(rawResponse), '. Next attempt after 300 ms.');
    await delay(300);
    const attempt2 = await getEarnings(symbol, howManyQuarters);
    earnings = attempt2.earnings;
    rawResponse = attempt2.rawResponse;
  }

  if (!earnings?.length) {
    console.log('Attempt 2: Nothing returned form API for ', symbol, JSON.stringify(rawResponse), '. Next attempt after 1000 ms.');
    await delay(1000);
    const attempt3 = await getEarnings(symbol, howManyQuarters);
    earnings = attempt3.earnings;
    rawResponse = attempt3.rawResponse;
  }

  if (!earnings?.length) {
    console.log('Attempt 3: Nothing returned form API for ', symbol, JSON.stringify(rawResponse));
  }

  return earnings;
}


export const syncStockEps = async (symbol: string, howManyQuarters = 8) => {
  const earnings = await getEarningsWithThreeAttempts(symbol, howManyQuarters);
  if (!earnings?.length) {
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