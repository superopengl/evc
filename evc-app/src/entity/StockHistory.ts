import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
export class StockHistory {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Index()
  symbol: string;

  @Column()
  @Index()
  changedAt: Date;

  @Column()
  company: string;

  @Column()
  market: string;

  @Column()
  peLo: number;

  @Column()
  peHi: number;

  @Column()
  value: number;

  @Column()
  supportPriceLo: number;

  @Column()
  supportPriceHi: number;

  @Column()
  pressurePriceLo: number;

  @Column()
  pressurePriceHi: number;

  @Column('uuid')
  by: string;

  @Column({ default: false })
  published: boolean;
}
