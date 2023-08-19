import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';



@Entity()
@Index('idx_support_symbol_lo', ['symbol', 'lo'])
@Index('idx_support_symbol_created', ['symbol', 'createdAt'])
export class StockSupport {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  symbol: string;

  @CreateDateColumn()
  createdAt?: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid')
  author: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  hi: number;
}
