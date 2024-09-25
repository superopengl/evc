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
  todayOptionVol: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  todayOptionVolDelta: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  putCallOIRatio: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  putCallOIRatioDelta: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  totalOpenInterest: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  totalOpenInterestDelta: number;

  @Column('jsonb')
  raw: object;
}
