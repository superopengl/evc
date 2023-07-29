import { PrimaryColumn, ViewColumn } from 'typeorm';


export abstract class StockPublishInformationBase {
  @ViewColumn()
  @PrimaryColumn()
  symbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  tags: string[];

  @ViewColumn()
  publishedAt: Date;

  @ViewColumn()
  supportLo: number;

  @ViewColumn()
  supportHi: number;

  @ViewColumn()
  resistanceLo: number;

  @ViewColumn()
  resistanceHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  lastPrice: number;

  @ViewColumn()
  isUnder: boolean;

  @ViewColumn()
  isOver: boolean;
}
