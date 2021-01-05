import { ViewColumn } from 'typeorm';


export abstract class StockPublishInformationBase {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  tags: string[];

  @ViewColumn()
  publishedAt: Date;

  @ViewColumn()
  supportShortLo: number;

  @ViewColumn()
  supportShortHi: number;

  @ViewColumn()
  supportLongLo: number;

  @ViewColumn()
  supportLongHi: number;

  @ViewColumn()
  resistanceShortLo: number;

  @ViewColumn()
  resistanceShortHi: number;

  @ViewColumn()
  resistanceLongLo: number;

  @ViewColumn()
  resistanceLongHi: number;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  rangeLo: number;

  @ViewColumn()
  rangeHi: number;

  @ViewColumn()
  lastPrice: number;

  @ViewColumn()
  isUnder: boolean;

  @ViewColumn()
  isOver: boolean;
}
