import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';
import { Index } from '../Index';
import { OptionPutCallStockDefInformation } from './OptionPutCallStockDefInformation';
import { unionAll } from '../../utils/unionAll';
import { OptionPutCallStockOrdinal } from '../OptionPutCallStockOrdinal';


@ViewEntity({
  expression: connection => connection
  .createQueryBuilder()
  .from(q => {
    const query1 = connection.createQueryBuilder()
    .from(Index, 'i')
    .select([
      'symbol',
      '"apiSymbol"',
      '"company"',
      '"type"',
      '"tagId"',
      '"sortGroup"',
      '-1 as "optionPutCallFetchTagOrdinal"',
      ]);
    const query2 = connection.createQueryBuilder()
    .from(OptionPutCallStockDefInformation, 's')
    .select([
      'symbol',
      '"apiSymbol"',
      '"company"',
      '"type"',
      '"tagId"',
      '"sortGroup"',
      '"optionPutCallFetchTagOrdinal"',
      ]);

    return unionAll(q, query1, query2);
    }, 'x')
  .leftJoin(OptionPutCallStockOrdinal, 'n', 'x.symbol = n.symbol AND x."tagId" = n.tag')
  .select([
    `x.symbol AS symbol`,
    `x."apiSymbol" AS "apiSymbol"`,
    `x.company AS company`,
    `x.type AS type`,
    `x."tagId" AS "tagId"`,
    `x."sortGroup" AS "sortGroup"`,
    `x."optionPutCallFetchTagOrdinal" AS "optionPutCallFetchTagOrdinal"`,
    `n.ordinal AS ordinal`,
    ])
  .orderBy('x."optionPutCallFetchTagOrdinal"', 'ASC', 'NULLS LAST')
  .addOrderBy('n.ordinal', 'ASC', 'NULLS LAST')
  })
export class OptionPutCallAllDefInformation {
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

  @ViewColumn()
  ordinal: number;
}
