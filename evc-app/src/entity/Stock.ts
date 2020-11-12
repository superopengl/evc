import { Entity, Column, PrimaryColumn, Index } from 'typeorm';


@Entity()
export class Stock {
  @PrimaryColumn()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column()
  company: string;

  @Column({ nullable: true })
  market: string;

  @Column('decimal')
  peLo: number;

  @Column('decimal')
  peHi: number;

  @Column('decimal')
  value: number;

  @Column('decimal')
  supportPriceLo: number;

  @Column('decimal')
  supportPriceHi: number;

  @Column('decimal')
  pressurePriceLo: number;

  @Column('decimal')
  pressurePriceHi: number;

  @Column('uuid')
  by: string;

  @Column({ default: false })
  shouldPublish: boolean;
}
