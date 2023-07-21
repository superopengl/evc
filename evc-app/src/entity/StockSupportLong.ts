import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockSupportLong {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  hi: number;

  @Column('int2', { default: 0 })
  loTrend: number;

  @Column('int2', { default: 0 })
  hiTrend: number;

  @Column({default: false})
  published: boolean;
}
