import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { StockResistanceShort } from './StockResistanceShort';
import { StockSupportShort } from './StockSupportShort';
import { StockFairValue } from './StockFairValue';
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
  fairValueId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  supportShortLo: number;

  @Column('int2', { default: 0 })
  supportShortLoTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  supportShortHi: number;

  @Column('int2', { default: 0 })
  supportShortHiTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  supportLongLo: number;

  @Column('int2', { default: 0 })
  supportLongLoTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  supportLongHi: number;

  @Column('int2', { default: 0 })
  supportLongHiTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  resistanceShortLo: number;

  @Column('int2', { default: 0 })
  resistanceShortLoTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  resistanceShortHi: number;

  @Column('int2', { default: 0 })
  resistanceShortHiTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  resistanceLongLo: number;

  @Column('int2', { default: 0 })
  resistanceLongLoTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  resistanceLongHi: number;

  @Column('int2', { default: 0 })
  resistanceLongHiTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueLo: number;

  @Column('int2', { default: 0 })
  fairValueLoTrend: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueHi: number;

  @Column('int2', { default: 0 })
  fairValueHiTrend: number;
}
