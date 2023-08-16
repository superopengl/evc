import { ViewEntity, Connection } from 'typeorm';
import { StockPublishInformationBase } from './StockPublishInformationBase';
import { StockLastPublishInformation } from './StockLastPublishInformation';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .select('x.*')
    .from(q => q.from(StockLastPublishInformation, 'h')
      .select('*'),
      // .addSelect('row_number() OVER(PARTITION BY symbol ORDER BY "publishedAt" DESC) AS row'),
      'x')
    // .where(`x.row = 2`)
})
export class StockGuestPublishInformation extends StockPublishInformationBase {
  constructor() {
    super();
  }
}
