import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, PrimaryGeneratedColumn, Index } from 'typeorm';
import { StockTag } from './StockTag';

@Entity()
export class Stock {
  @PrimaryColumn()
  symbol: string;

  @Column()
  company: string;

  @ManyToMany(type => StockTag, { onDelete: 'CASCADE' })
  @JoinTable()
  tags: StockTag[];
}


