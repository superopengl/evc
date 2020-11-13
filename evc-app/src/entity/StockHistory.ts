import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class StockHistory {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Index()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column()
  company: string;

  @Column({nullable: true})
  market: string;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  peLo: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  peHi: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  value: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  supportPriceLo: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  supportPriceHi: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  pressurePriceLo: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  pressurePriceHi: number;

  @Column('uuid')
  by: string;

  @Column({ default: false })
  isPublished: boolean;
}
