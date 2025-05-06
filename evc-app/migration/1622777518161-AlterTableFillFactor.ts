import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';
import { StockLastPrice } from '../src/entity/StockLastPrice';
import { StockEps } from '../src/entity/StockEps';

export class AlterTableFillFactor1622777518161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [StockLastPrice, StockEps];
    for (const table of tables) {
      const { schema, tableName } = getRepository(table).metadata;
      queryRunner.query(`ALTER TABLE "${schema}"."${tableName}" SET (fillfactor = 30)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
