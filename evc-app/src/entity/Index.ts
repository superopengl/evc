import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 *   
 * SELECT 'SPX' as symbol, '$SPX' as "apiSymbol", 'S&P 500 Index' as company, 'INDEX' as type
  UNION ALL
  SELECT 'NDX(IUXX)' as symbol, '$IUXX' as "apiSymbol", 'Nasdaq 100 Index' as company, 'INDEX' as type
  UNION ALL
  SELECT 'DJI(DJX)' as symbol, '$DJX' as "apiSymbol", 'Dow Jones Industrials Average Index' as company, 'INDEX' as type
  UNION ALL
  SELECT 'VIX' as symbol, '$VIX' as "apiSymbol", 'CBOE Volatility Index' as company, 'INDEX' as type
 */

@Entity()
export class Index {
  @PrimaryColumn()
  symbol: string;

  @Column()
  apiSymbol: string;

  @Column()
  company: string;

  @Column()
  type: string;

  @Column({ default: 10 })
  sortGroup?: number;
}
