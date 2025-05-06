import { ViewEntity, Connection, ViewColumn, PrimaryColumn, getManager, getRepository } from 'typeorm';
import { Stock } from '../Stock';
import { StockTag } from '../StockTag';


@ViewEntity({
  expression: (connection: Connection) => connection
  .createQueryBuilder()
  .from(Stock, 's')
// .innerJoin(q => q.from('stock_tags_stock_tag', 'stst'), 'stst', 's.symbol = stst."stockSymbol"')
// .innerJoin(StockTag, 'st', 'stst."stockTagId" = st.id')
  .leftJoin(q => q
    .from('stock_tags_stock_tag', 'stst')
    .innerJoin(StockTag, 'st', 'stst."stockTagId" = st.id')
    .where('st."includesOptionPutCall" IS TRUE'),
    'sti', 's.symbol = sti."stockSymbol"'
  )
  .distinctOn(['s.symbol'])
  .orderBy('s.symbol', 'ASC')
  .addOrderBy('sti."optionPutCallFetchTagOrdinal"', 'ASC', 'NULLS LAST')
  .select([
    's.symbol AS symbol',
    's.symbol AS "apiSymbol"',
    's.company AS company',
    'sti."name" AS "type"',
    'sti."id" AS "tagId"',
    'sti."sortGroup" AS "sortGroup"',
    'sti."optionPutCallFetchTagOrdinal" as "optionPutCallFetchTagOrdinal"',
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
  tagId: string;

  @ViewColumn()
  sortGroup: number;

  @ViewColumn()
  optionPutCallFetchTagOrdinal: number;
}
