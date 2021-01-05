import { Entity, Column, PrimaryGeneratedColumn, Index, PrimaryColumn } from 'typeorm';


@Entity()
export class StockHotSearch {
  @PrimaryColumn()
  symbol: string;

  @Column('bigint')
  count: number;
}
