import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class StockLastPrice {
  @PrimaryColumn()
  symbol: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  price: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  change: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  changePercent: number;

  @Column()
  updatedAt?: Date;
}
