import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';



@Entity()
@Index('idx_resistance_symbol_lo', ['symbol', 'lo'])
@Index('idx_resistance_symbol_created', ['symbol', 'createdAt'])
export class StockResistance {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Index()
  symbol: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  lo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  hi: number;
}
