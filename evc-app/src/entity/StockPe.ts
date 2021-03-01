import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockSpecialFairValue } from './StockSpecialFairValue';


@Entity()
@Index(['symbol', 'date'])
export class StockPe {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({type: 'date', default: 'now()'})
  date?: Date;

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
}

