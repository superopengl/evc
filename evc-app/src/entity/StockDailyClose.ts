import { Entity, Column, Index, JoinColumn, ManyToOne, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


@Entity()
@Index(['symbol', 'date'], { unique: true })
export class StockDailyClose {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  close: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  extendedClose: number;
}
