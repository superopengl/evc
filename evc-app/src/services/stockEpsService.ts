import { getManager } from 'typeorm';
import { StockEps } from '../entity/StockEps';
import { getEarnings } from './alphaVantageService';
import * as _ from 'lodash';
import * as delay from 'delay';
import { backOff } from "exponential-backoff";

type StockIexEpsInfo = {
  symbol: string;
  reportDate: string;
  value: number;
};

async function getEarningsWithThreeAttempts(symbol: string, howManyQuarters: number) {
  let attempt = 0;
  const earningsResult = await backOff(async () => {
    attempt++;
    const { earnings, rawResponse } = await getEarnings(symbol, howManyQuarters);
    if (!earnings?.length) {
      console.log(`Attempt ${attempt}: Nothing returned form API for `, symbol, JSON.stringify(rawResponse));
      if (rawResponse?.Information) {
        throw new Error('AlphaVantage API returns nothing');
      }
    }
    return earnings;
  }, {
    delayFirstAttempt: false,
    startingDelay: 500,
    timeMultiple: 3,
    numOfAttempts: 10,
    maxDelay: 5 * 1000 // 5 seconds
  });

  return earningsResult;
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
    .orIgnore()
    // .onConflict('(symbol, "reportDate") DO UPDATE SET value = excluded.value')
    .execute();
};