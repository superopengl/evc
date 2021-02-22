import { ViewEntity, Connection, PrimaryColumn, ViewColumn } from 'typeorm';
import { StockLatestStockInformation } from './StockLatestStockInformation';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .select('x.*')
    .from(q => q.from(StockLatestStockInformation, 'h')
      .select('*'),
    // .addSelect('row_number() OVER(PARTITION BY symbol ORDER BY "publishedAt" DESC) AS row'),
    'x')
    // .where(`x.row = 2`)
})
export class StockGuestPublishInformation {
  @ViewColumn()
  @PrimaryColumn()
  symbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  tags: string[];

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
