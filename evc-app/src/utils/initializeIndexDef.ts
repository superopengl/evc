import { Connection } from 'typeorm';
import { Index } from '../entity/Index';
import { getManager } from 'typeorm-plus';


export async function initializeIndexDef(connection: Connection) {
  const entities: Index[] = [
    {
      symbol: 'SPX',
      apiSymbol: '$SPX',
      company: 'S&P 500 Index',
      type: 'INDEX',
    },
    {
      symbol: 'NDX(IUXX)',
      apiSymbol: '$IUXX',
      company: 'Nasdaq 100 Index',
      type: 'INDEX',
    },
    {
      symbol: 'DJI(DJX)',
      apiSymbol: '$DJX',
      company: 'Dow Jones Industrials Average Index',
      type: 'INDEX',
    },
    {
      symbol: 'VIX',
      apiSymbol: '$VIX',
      company: 'CBOE Volatility Index',
      type: 'INDEX',
    },
  ];

  await connection
    .createQueryBuilder()
    .insert()
    .into(Index)
    .values(entities)
    .orIgnore()
    .execute();
}
