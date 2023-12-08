import { ViewEntity, Connection, ViewColumn, PrimaryColumn, getManager, getRepository } from 'typeorm';
import { Stock } from '../Stock';
import { StockTag } from '../StockTag';


@ViewEntity({
  expression: (connection: Connection) => connection
    .createQueryBuilder()
    .from(Stock, 's')
    .innerJoin(q => q.from('stock_tags_stock_tag', 'stst'), 'stst', 's.symbol = stst."stockSymbol"')
    .innerJoin(StockTag, 'st', 'stst."stockTagId" = st.id')
    .where('st."includesOptionPutCall" IS TRUE')
    .select([
      's.symbol AS symbol',
      's.symbol AS "apiSymbol"',
      's.company AS company',
      'st."name" AS "type"',
      'st."sortGroup" AS "sortGroup"',
    ]),
})
export class OptionPutCallStockDefInformation {
  @ViewColumn()
  @PrimaryColumn()
  symbol: string;

  @ViewColumn()
  apiSymbol: string;

  @ViewColumn()
  company: string;

  @ViewColumn()
  type: string;

  @ViewColumn()
  sortGroup: number;
}
