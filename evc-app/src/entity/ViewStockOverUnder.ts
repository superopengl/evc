import { ViewColumn, ViewEntity, Connection } from 'typeorm';
import { Stock } from './Stock';
import { StockPublish } from './StockPublish';
import { StockSupportShort } from './StockSupportShort';
import { StockSupportLong } from './StockSupportLong';
import { StockResistanceShort } from './StockResistanceShort';
import { StockResistanceLong } from './StockResistanceLong';
import { StockFairValue } from './StockFairValue';
import { ViewStockPublish } from './ViewStockPublish';
import { StockLastPrice } from './StockLastPrice';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(Stock, 's')
    .select('s.symbol as symbol')
    .leftJoin(q => q.from(ViewStockPublish, 'vsp'),
      'vsp', 'vsp.symbol = s.symbol'
    )
    // .addSelect([
    //   `vsp."supportShortLo" as lo`,
    //   `vsp."resistanceShortHi" as hi`,
    // ])
    .leftJoin(q => q.from(StockLastPrice, 'slp'),
      'slp', 'slp.symbol = s.symbol'
    )
    // .addSelect('slp.price as price')
    .addSelect('CASE WHEN slp.price < vsp."supportShortLo" THEN TRUE ELSE FALSE END as "isUnder"')
    .addSelect('CASE WHEN slp.price > vsp."resistanceShortHi" THEN TRUE ELSE FALSE END as "isOver"')
})
export class ViewStockOverUnder {
  @ViewColumn()
  symbol: string;

  @ViewColumn()
  isUnder: boolean;

  @ViewColumn()
  isOver: boolean;
}
