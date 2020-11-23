import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


@Entity()
@Index('idx_stockEps_symbol_year_quarter', ['symbol', 'year', 'quarter'])
export class StockEps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column('uuid')
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
