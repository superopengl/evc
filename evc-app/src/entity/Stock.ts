import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity()
export class Stock {
  @PrimaryColumn()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  changedAt?: Date;

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
