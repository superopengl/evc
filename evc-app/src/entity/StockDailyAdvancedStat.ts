import { Entity, Column, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


@Entity()
export class StockDailyAdvancedStat {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  date: string;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  putCallRatio: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  beta: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  peRatio: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  forwardPeRatio: number;
}
