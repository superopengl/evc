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

function temp_adjustForwardPeRatio(symbol, rawForwardPeRatio) {
  switch (symbol) {
    case 'WMT':
      return (+rawForwardPeRatio) * 3;
    case 'NVDA':
    // return (+rawForwardPeRatio) * 10;
    default:
      return rawForwardPeRatio;
  }
}

export async function syncManyStockAdcancedStat(info: StockAdvancedStatsInfo[]) {
  const entites = info.map(item => {
    const { symbol, putCallRatio, beta, peRatio, forwardPeRatio, date } = item;

    const entity = new StockDailyAdvancedStat();
    entity.symbol = symbol;
    entity.putCallRatio = putCallRatio;
    entity.beta = beta;
    entity.peRatio = peRatio;
    entity.forwardPeRatio = temp_adjustForwardPeRatio(symbol, forwardPeRatio);
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


