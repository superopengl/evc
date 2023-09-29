import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';



@Entity()
@Index('idx_support_symbol_lo_hi', ['symbol', 'lo', 'hi'], {unique: true})
export class StockSupport {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  symbol: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  hi: number;
}
