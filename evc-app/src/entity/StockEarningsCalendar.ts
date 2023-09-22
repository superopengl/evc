import { Entity, PrimaryColumn, Index } from 'typeorm';


@Entity()
export class StockEarningsCalendar {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  @Index()
  reportDate: string;
}
