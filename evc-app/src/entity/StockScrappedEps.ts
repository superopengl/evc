import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
export class StockScrappedEps {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  reportDate: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  value: number;
}
