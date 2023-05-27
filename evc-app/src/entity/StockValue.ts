import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Stock } from './Stock';
import { StockPublish } from './StockPublish';
import { StockEps } from './StockEps';
import { StockPe } from './StockPe';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockValue {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  hi: number;

  @Column({ default: false })
  special: boolean;

  @Column('uuid', {array: true})
  epsIds: string[];

  @Column('uuid')
  peId: string;
}
