import { Entity, PrimaryColumn, Column, Index } from 'typeorm';


@Entity()
export class SupportResistancePreviousSnapshot {
  @PrimaryColumn()
  symbol: string;

  @Column('json', { array: true, nullable: true })
  supports: { lo: number; hi: number }[];

  @Column('json', { array: true, nullable: true })
  resistances: { lo: number; hi: number }[];

  @Column()
  @Index()
  hash: string;

  @Column('date')
  date: string;
}


