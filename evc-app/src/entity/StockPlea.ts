import { Entity, Column, PrimaryColumn, CreateDateColumn, DeleteDateColumn, Index } from 'typeorm';


@Entity()
export class StockPlea {
  @PrimaryColumn()
  symbol: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @Index()
  deletedAt: Date;

  @Column({ default: 1 })
  @Index()
  count: number;
}
