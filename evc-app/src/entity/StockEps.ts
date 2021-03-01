import { Entity, Column, JoinColumn, ManyToOne, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
@Entity()
export class StockEps {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  reportDate: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;


  @Column('smallint')
  year: number;

  @Column('smallint')
  quarter: number;


  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  value: number;
}
