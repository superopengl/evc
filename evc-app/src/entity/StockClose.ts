import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';


@Entity()
@Index(['symbol', 'date'], { unique: true })
export class StockClose {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({ type: 'date' })
  date?: string;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  close: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  extendedClose: number;
}
