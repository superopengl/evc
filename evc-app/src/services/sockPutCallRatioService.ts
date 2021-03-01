import { getManager } from 'typeorm';
import { StockEps } from '../entity/StockEps';
import { StockIexEpsInfo } from './stockEpsService';
import { StockDailyPutCallRatio } from '../entity/StockDailyPutCallRatio';


export type StockAdvancedStatsInfo = {
  symbol: string;
  putCallRatio: number;
  date: string;
  rawResponse: any;
}

export async function syncManyStockPutCallRatio(info: StockAdvancedStatsInfo[]) {
  const entites = info.map(item => {
    const { symbol, putCallRatio, date, rawResponse } = item;
    if(!putCallRatio || !date) {
      return null;
    }

    const entity = new StockDailyPutCallRatio();
    entity.symbol = symbol;
    entity.putCallRatio = putCallRatio;
    entity.date = date;
    entity.rawResponse = rawResponse;
    return entity;
  }).filter(x => !!x);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockDailyPutCallRatio)
    .values(entites)
    .onConflict('(symbol, date) DO NOTHING')
    .execute();
}


