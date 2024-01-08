import { Entity, PrimaryColumn, Column, Unique, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
@Unique('idx_unique_insider_pre_symbol_discardAt', ['symbol', 'discardedAt'])
export class StockInsiderTransactionPreviousSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column({ nullable: true })
  discardedAt: Date;

  @Column()
  createdAt: Date;

  @Column('json', { nullable: true })
  value: any;

  @Column('json', { nullable: true })
  first: any;

  @Column({ nullable: true })
  firstHash: string;
}
