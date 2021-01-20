import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockFairValue } from './StockFairValue';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockPe {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  hi: number;

  @Column('int2', { default: 0 })
  loTrend: number;

  @Column('int2', { default: 0 })
  hiTrend: number;
}
