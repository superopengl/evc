import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';


@Entity()
export class StockInsiderTransaction {
  @PrimaryColumn()
  symbol: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('json', { nullable: true })
  value: any;
}
