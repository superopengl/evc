import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { StockResistanceShort } from './StockResistanceShort';
import { StockSupportShort } from './StockSupportShort';
import { StockValue } from './StockValue';
import { Stock } from './Stock';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockPublish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('uuid')
  supportShortId: string;

  @Column('uuid')
  supportLongId: string;

  @Column('uuid')
  resistanceShortId: string;

  @Column('uuid')
  resistanceLongId: string;

  @Column('uuid')
  valueId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  valueLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  valueHi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  supportShortLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  supportShortHi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  supportLongLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  supportLongHi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  resistanceShortLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  resistanceShortHi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  resistanceLongLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  resistanceLongHi: number;
}
