import { getManager } from 'typeorm';
import { StockDailyAdvancedStat } from '../entity/StockDailyAdvancedStat';


export type StockAdvancedStatsInfo = {
  symbol: string;
  putCallRatio: number;
  beta: number;
  peRatio: number;
  forwardPeRatio: number;
  date: string;
  rawResponse: any;
}

export async function syncManyStockAdcancedStat(info: StockAdvancedStatsInfo[]) {
  const entites = info.map(item => {
    const { symbol, putCallRatio, beta, peRatio, forwardPeRatio, date } = item;
    if (!putCallRatio || !date) {
      return null;
    }

    const entity = new StockDailyAdvancedStat();
    entity.symbol = symbol;
    entity.putCallRatio = putCallRatio;
    entity.beta = beta;
    entity.peRatio = peRatio;
    entity.forwardPeRatio = forwardPeRatio;
    entity.date = date;
    return entity;
  }).filter(x => !!x);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockDailyAdvancedStat)
    .values(entites)
    .orIgnore()
    .execute();
}


