import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockResistance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  // @Column('uuid')
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
}
