import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockValue } from './StockValue';


@Entity()
@Index('idx_stockEps_symbol_year_quarter', ['symbol', 'year', 'quarter'], {unique: true})
export class StockEps {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('smallint')
  year: number;

  @Column('smallint')
  quarter: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  value: number;
}
