import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { Stock } from '../Stock';
import { StockLastPrice } from '../StockLastPrice';
import { StockLatestFairValue } from './StockLatestFairValue';
import { StockSupport } from '../StockSupport';
import { StockResistance } from '../StockResistance';

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
    .leftJoin(q => q.from(StockLatestFairValue, 'sfv'),
      'sfv', 'sfv.symbol = s.symbol'
    )
    .addSelect('sfv."fairValueLo"')
    .addSelect('sfv."fairValueHi"')
    .leftJoin(q => q.from(StockLastPrice, 'slp'),
      'slp', 'slp.symbol = s.symbol'
    )
    .addSelect('slp.price as "lastPrice"')
    .addSelect('slp.change as "lastChange"')
    .addSelect('slp."changePercent" as "lastChangePercent"')
    .addSelect('CASE WHEN slp.price < sfv."fairValueLo" THEN TRUE ELSE FALSE END as "isUnder"')
    .addSelect('CASE WHEN slp.price > sfv."fairValueHi" THEN TRUE ELSE FALSE END as "isOver"')
    .leftJoin(q =>
      q.from(q =>
        q.from(StockSupport, 'x')
          .select([
            'symbol',
            'lo',
            'hi',
            `RANK() OVER (PARTITION BY symbol ORDER BY lo DESC, hi DESC) AS rank`
          ]),
      'sup')
        .where(`rank <= 3`)
        .groupBy('symbol')
        .select('symbol')
        .addSelect('array_agg(json_build_object(\'lo\', lo, \'hi\', hi)) as values'),
    'support', 'support.symbol = s.symbol'
    )
    .addSelect('support.values as supports')
    .leftJoin(q =>
      q.from(q =>
        q.from(StockResistance, 'x')
        .select([
          'symbol',
          'lo',
          'hi',
          `RANK() OVER (PARTITION BY symbol ORDER BY lo ASC, hi ASC) AS rank`
        ]),
      'sup')
        .where(`rank <= 3`)
        .groupBy('symbol')
        .select('symbol')
        .addSelect('array_agg(json_build_object(\'lo\', lo, \'hi\', hi)) as values'),
    'resistance', 'resistance.symbol = s.symbol'
    )
    .addSelect('resistance.values as resistances')
})
export class StockLatestPaidInformation {
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
  lastChange: number;

  @ViewColumn()
  lastChangePercent: number;

  @ViewColumn()
  isUnder: boolean;

  @ViewColumn()
  isOver: boolean;

  @ViewColumn()
  supports: { lo: number; hi: number }[];

  @ViewColumn()
  resistances: { lo: number; hi: number }[];
}

