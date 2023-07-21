import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockFairValue } from './StockFairValue';


@Entity()
@Index('idx_stockEps_symbol_year_quarter', ['symbol', 'year', 'quarter'], {unique: true})
export class StockEps {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('smallint')
  year: number;

  @Column('smallint')
  quarter: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  value: number;

  @Column({nullable: true})
  trend: boolean;
}
