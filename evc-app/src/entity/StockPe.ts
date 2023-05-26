import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockValue } from './StockValue';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockPe {
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

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  hi: number;
}
