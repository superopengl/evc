import { Entity, Column, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


/**
 * @deprecated This table is not being used. Can drop after migrating data to StockDailyAdcancedStat table
 */
@Entity()
export class StockDailyPutCallRatio {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  date: string;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  putCallRatio: number;
}
