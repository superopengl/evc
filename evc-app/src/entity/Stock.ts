import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { StockTag } from './StockTag';

@Entity()
export class Stock {
  @PrimaryColumn()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  company: string;

  @ManyToMany(type => StockTag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: StockTag[];

  @Column()
  by: string;
}


