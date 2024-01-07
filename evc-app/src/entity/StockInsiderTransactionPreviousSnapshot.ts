import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';


@Entity()
export class StockInsiderTransactionPreviousSnapshot {
  @PrimaryColumn()
  symbol: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('json', { nullable: true })
  value: any;

  @Column('json', { nullable: true })
  first: any;

  @Column({ nullable: true })
  firstHash: string;
}
