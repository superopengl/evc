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
      `n.ordinal AS ordinal`,
    ])
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
  ordinal: number;
}
