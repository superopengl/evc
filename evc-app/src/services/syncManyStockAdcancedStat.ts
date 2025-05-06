import { getManager } from 'typeorm';
import { StockDailyAdvancedStat } from '../entity/StockDailyAdvancedStat';


export type StockAdvancedStatsInfo = {
  symbol: string;
  beta: number;
  peRatio: number;
  forwardPeRatio: number;
  date: string;
  rawResponse: any;
};

export async function syncManyStockAdcancedStat(info: StockAdvancedStatsInfo[]) {
  const entites = info.map(item => {
    const { symbol, beta, peRatio, forwardPeRatio, date } = item;

    const entity = new StockDailyAdvancedStat();
    entity.symbol = symbol;
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
    .onConflict(`(symbol, date) DO UPDATE SET  
"beta"=excluded."beta", 
"peRatio"=excluded."peRatio", 
"forwardPeRatio"=excluded."forwardPeRatio"`)
    .execute();
}


