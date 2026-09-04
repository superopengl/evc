import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import { StockLatestPaidInformation } from './StockLatestPaidInformation';

@ViewEntity({
  expression: (connection: DataSource) => connection
  .createQueryBuilder()
  .from(StockLatestPaidInformation, 'spi')
  .select([
    'symbol',
    '"fairValueLo"',
    '"fairValueHi"',
    'md5(row("fairValueLo", "fairValueHi")::text) as hash',
    'CURRENT_DATE as date'
    ])
  .where(`"fairValueLo" IS NOT NULL`)
  })
export class FairValueLatestSnapshot {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  fairValueLo: number;

  @ViewColumn()
  fairValueHi: number;

  @ViewColumn()
  hash: string;

  @ViewColumn()
  date: string;
}


