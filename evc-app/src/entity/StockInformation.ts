import { ViewColumn, ViewEntity, Connection } from 'typeorm';
import { Stock } from './Stock';
import { StockPublish } from './StockPublish';
import { StockSupportShort } from './StockSupportShort';
import { StockSupportLong } from './StockSupportLong';
import { StockResistanceShort } from './StockResistanceShort';
import { StockResistanceLong } from './StockResistanceLong';
import { StockFairValue } from './StockFairValue';
import { StockLastPrice } from './StockLastPrice';


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
    .leftJoin(q => q.from(StockPublish, 'pu'),
      // .distinctOn(['pu.symbol'])
      // .orderBy('pu.symbol')
      // .addOrderBy('pu.createdAt', 'DESC'),
      'pu', 'pu.symbol = s.symbol'
    )
    .addSelect('pu."createdAt" as "publishedAt"')
    .leftJoin(q => q.from(StockSupportShort, 'sss'),
      'sss', 'sss.id = pu."supportShortId"'
    )
    .addSelect('sss.lo as "supportShortLo"')
    .addSelect('sss.hi as "supportShortHi"')
    .leftJoin(q => q.from(StockSupportLong, 'ssl'),
      'ssl', 'ssl.id = pu."supportLongId"'
    )
    .addSelect('ssl.lo as "supportLongLo"')
    .addSelect('ssl.hi as "supportLongHi"')
    .leftJoin(q => q.from(StockResistanceShort, 'srs'),
      'srs', 'srs.id = pu."resistanceShortId"'
    )
    .addSelect('srs.lo as "resistanceShortLo"')
    .addSelect('srs.hi as "resistanceShortHi"')
    .leftJoin(q => q.from(StockResistanceLong, 'srl'),
      'srl', 'srl.id = pu."resistanceLongId"'
    )
    .addSelect('srl.lo as "resistanceLongLo"')
    .addSelect('srl.hi as "resistanceLongHi"')
    .leftJoin(q => q.from(StockFairValue, 'sfv'),
      'sfv', 'sfv.id = pu."fairValueId"'
    )
    .addSelect('sfv.lo as "fairValueLo"')
    .addSelect('sfv.hi as "fairValueHi"')
    .leftJoin(q => q.from(StockLastPrice, 'slp'),
      'slp', 'slp.symbol = s.symbol'
    )
    .addSelect('slp.price as "lastPrice"')
    .addSelect('CASE WHEN slp.price < sss.lo THEN TRUE ELSE FALSE END as "isUnder"')
    .addSelect('CASE WHEN slp.price > srs.hi THEN TRUE ELSE FALSE END as "isOver"')
})
export class StockInformation {
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
  lastPrice: number;

  @ViewColumn()
  isUnder: boolean;

  @ViewColumn()
  isOver: boolean;
}
