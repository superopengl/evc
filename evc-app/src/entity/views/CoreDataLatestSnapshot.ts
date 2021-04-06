import { ViewEntity, Connection, ViewColumn } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';

@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(StockLatestPaidInformation, 'spi')
    .select([
      'symbol',
      '"fairValueLo"',
      '"fairValueHi"',
      'supports',
      'resistances',
      'md5(row("fairValueLo", "fairValueHi", supports, resistances)::text) as hash',
      'CURRENT_DATE as date'
    ])
    .where(`"fairValueLo" IS NOT NULL`)
})
export class CoreDataLatestSnapshot {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  supports: { lo: number, hi: number }[];

  @ViewColumn()
  resistances: { lo: number, hi: number }[];

  @ViewColumn()
  hash: string;

  @ViewColumn()
  date: string;
}


