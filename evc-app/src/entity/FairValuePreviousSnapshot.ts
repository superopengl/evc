import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class FairValuePreviousSnapshot {
  @PrimaryColumn()
  symbol: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueLo: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  fairValueHi: number;

  @Column()
  @Index()
  hash: string;

  @Column('date')
  date: string;
}
