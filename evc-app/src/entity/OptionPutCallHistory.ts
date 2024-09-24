import { Entity, PrimaryColumn, Index, Column, Generated } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
export class OptionPutCallHistory {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  date: string;

  @Column()
  name: string;

  @Column()
  @Index()
  type: 'index' | 'etfs' | 'nasdaq';

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  putCallVol: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  todayTotalVol: number;

  /**
   * P/C OI; Total P/C OI Ratio
   */
  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  putCallOIRatio: number;

  /**
   * Total OI; Total Open Interest
   */
  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  totalOpenInterest: number;

  @Column('jsonb')
  raw: object;
}
