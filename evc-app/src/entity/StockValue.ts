import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockPublish } from './StockPublish';


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

  @OneToOne(() => StockPublish, {nullable: true})
  @JoinColumn()
  publish: StockPublish;

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
