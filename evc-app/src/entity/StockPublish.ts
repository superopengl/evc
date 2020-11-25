import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { StockResistance } from './StockResistance';
import { StockSupport } from './StockSupport';
import { StockValue } from './StockValue';
import { Stock } from './Stock';


@Entity()
@Index(['symbol', 'createdAt'])
export class StockPublish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  stock: Stock;

  @Column()
  symbol: string;

  @Column('uuid')
  author: string;

  @Column('uuid')
  supportId: string;

  @Column('uuid')
  resistanceId: string;

  @Column('uuid')
  valueId: string;
}
