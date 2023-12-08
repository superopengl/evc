import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';
import { Index } from '../Index';
import { OptionPutCallStockDefInformation } from './OptionPutCallStockDefInformation';
import { unionAll } from '../../utils/unionAll';


@ViewEntity({
  expression: connection => connection.createQueryBuilder()
    .from(q => {
      const query1 = connection.createQueryBuilder().from(Index, 'i');
      const query2 = connection.createQueryBuilder().from(OptionPutCallStockDefInformation, 's');

      return unionAll(q, query1, query2);
    }, 'x')
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
  tag: string;

  @ViewColumn()
  sortGroup: number;
}
