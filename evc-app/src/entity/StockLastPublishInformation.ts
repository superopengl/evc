import { ViewEntity, Connection } from 'typeorm';
import { StockPublishInformationBase } from './StockPublishInformationBase';
import { StockHistoricalPublishInformation } from './StockHistoricalPublishInformation';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(StockHistoricalPublishInformation, 'h')
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
