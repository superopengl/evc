import { DateFilterList } from 'aws-sdk/clients/securityhub';
import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockSpecialFairValue {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
  
  @Column()
  symbol: string;

  @Column({ type: 'date' })
  date: string;

  @Column('uuid')
  author: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueHi: number;

  @Column({nullable: true})
  published: Date;
}
