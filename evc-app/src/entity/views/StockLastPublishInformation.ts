import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockLastPrice } from '../StockLastPrice';
import { StockLastFairValue } from './StockLastFairValue';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Stock, 's')
    .select([
      's.symbol as symbol',
      'company'
    ])
    .leftJoin(q => q.from('stock_tags_stock_tag', 'tg')
      .groupBy('tg."stockSymbol"')
      .select([
        'tg."stockSymbol" as symbol',
        'array_agg(tg."stockTagId") as tags'
      ]),
      'tg', 'tg.symbol = s.symbol'
    )
    .addSelect('tg.tags')
    .leftJoin(q => q.from(StockLastFairValue, 'sfv'),
      'sfv', 'sfv.symbol = s.symbol'
    )
    .addSelect('sfv."fairValueLo"')
    .addSelect('sfv."fairValueHi"')
    .leftJoin(q => q.from(StockLastPrice, 'slp'),
      'slp', 'slp.symbol = s.symbol'
    )
    .addSelect('slp.price as "lastPrice"')
    .addSelect('CASE WHEN slp.price < sfv."fairValueLo" THEN TRUE ELSE FALSE END as "isUnder"')
    .addSelect('CASE WHEN slp.price > sfv."fairValueHi" THEN TRUE ELSE FALSE END as "isOver"')
})
export class StockLastPublishInformation {
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

