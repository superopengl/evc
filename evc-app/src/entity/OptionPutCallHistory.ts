import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
export class OptionPutCallHistory {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  date: string;

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
