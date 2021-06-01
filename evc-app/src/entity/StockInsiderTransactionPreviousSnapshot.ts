import { Entity, PrimaryColumn, Column, Index, UpdateDateColumn } from 'typeorm';


@Entity()
export class StockInsiderTransactionPreviousSnapshot {
  @PrimaryColumn()
  symbol: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('json', { nullable: true })
  value: any;
}
