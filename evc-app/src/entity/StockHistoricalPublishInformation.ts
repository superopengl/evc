import { ViewEntity, Connection } from 'typeorm';
import { Stock } from './Stock';
import { StockPublish } from './StockPublish';
import { StockSupport } from './StockSupport';
import { StockResistance } from './StockResistance';
import { StockFairValue } from './StockFairValue';
import { StockLastPrice } from './StockLastPrice';
import { StockPublishInformationBase } from './StockPublishInformationBase';

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
    .leftJoin(q => q.from(StockSupport, 'spt'),
      'spt', 'spt.id = pu."supportId"'
    )
    .addSelect('spt.lo as "supportLo"')
    .addSelect('spt.hi as "supportHi"')
    .leftJoin(q => q.from(StockResistance, 'srs'),
      'srs', 'srs.id = pu."resistanceId"'
    )
    .addSelect('srs.lo as "resistanceLo"')
    .addSelect('srs.hi as "resistanceHi"')
    .leftJoin(q => q.from(StockFairValue, 'sfv'),
      'sfv', 'sfv.id = pu."fairValueId"'
    )
    .addSelect('sfv.lo as "fairValueLo"')
    .addSelect('sfv.hi as "fairValueHi"')
    .leftJoin(q => q.from(StockLastPrice, 'slp'),
      'slp', 'slp.symbol = s.symbol'
    )
    .addSelect('slp.price as "lastPrice"')
    .addSelect('CASE WHEN slp.price < sfv.lo THEN TRUE ELSE FALSE END as "isUnder"')
    .addSelect('CASE WHEN slp.price > sfv.hi THEN TRUE ELSE FALSE END as "isOver"')
})
export class StockHistoricalPublishInformation extends StockPublishInformationBase {
  constructor() {
    super();
  }
}

