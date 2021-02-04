import { ViewEntity, Connection } from 'typeorm';
import { StockPublishInformationBase } from './StockPublishInformationBase';
import { StockAllPublishInformation } from './StockAllPublishInformation';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockAllPublishInformation, 'h')
    .select('*')
    .distinctOn(['h.symbol'])
    .orderBy('h.symbol')
    .addOrderBy('h.publishedAt', 'DESC')
})
export class StockLastPublishInformation extends StockPublishInformationBase {
  constructor() {
    super();
  }
}