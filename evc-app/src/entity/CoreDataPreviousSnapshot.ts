import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class CoreDataPreviousSnapshot {
  @PrimaryColumn()
  symbol: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueHi: number;

  @Column('json', { array: true, nullable: true })
  supports: { lo: number; hi: number; }[];

  @Column('json', { array: true, nullable: true })
  resistances: { lo: number; hi: number; }[];

  @Column()
  @Index()
  hash: string;

  @Column('date')
  date: string;
}
