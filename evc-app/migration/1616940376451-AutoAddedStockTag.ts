import {getRepository, MigrationInterface, QueryRunner} from 'typeorm';
import { StockTag } from '../src/entity/StockTag';
import { AUTO_ADDED_MOST_STOCK_TAG_ID } from '../src/utils/stockTagService';

export class AutoAddedStockTag1616940376451 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const stockTag = new StockTag();
    stockTag.id = AUTO_ADDED_MOST_STOCK_TAG_ID;
    stockTag.name = 'Most Actives & Gainers & Losers Auto Added',
    stockTag.officialOnly = true,
    await getRepository(StockTag).insert(stockTag);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
