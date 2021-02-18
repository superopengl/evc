import { Entity, Column, PrimaryColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';


@Entity()
export class StockPlea {
  @PrimaryColumn()
  symbol: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ default: 1 })
  count: number;
}
