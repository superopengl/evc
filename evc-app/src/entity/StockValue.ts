import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockValue {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column('uuid')
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  hi: number;

  @Column({ default: false })
  special: boolean;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true, array: true })
  sourceEps: number[];

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true, array: true })
  sourcePe: number[];
}