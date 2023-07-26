import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Stock } from './Stock';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
@Index(['symbol', 'createdAt'])
export class StockPublish {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('uuid')
  supportId: string;

  @Column('uuid')
  resistanceId: string;

  @Column('uuid')
  fairValueId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  supportLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  supportHi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  resistanceLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  resistanceHi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueHi: number;
}
