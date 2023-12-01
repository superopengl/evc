import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockLatestPaidInformation, 'spi')
    .select([
      'symbol',
      'supports',
      'resistances',
      'md5(row(supports, resistances)::text) as hash',
      'CURRENT_DATE as date'
    ])
})
export class SupportResistanceLatestSnapshot {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  supports: { lo: number, hi: number }[];

  @ViewColumn()
  resistances: { lo: number, hi: number }[];

  @ViewColumn()
  hash: string;

  @ViewColumn()
  date: string;
}


