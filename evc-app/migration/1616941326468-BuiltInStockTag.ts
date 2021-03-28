import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { StockTag } from "../src/entity/StockTag";

export class BuiltInStockTag1616941326468 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const { schema, tableName } = getRepository(StockTag).metadata;
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Dow Jones 30'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Nasdaq 100'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Nasdaq Composite'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Russell 2000'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 100'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 400'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Russell 1000'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Russell 3000'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Information Technology'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Consumer Discretionary'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Consumer Staples'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Energies'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Financials'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Health Care'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Utilities'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Real Estate'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Materials'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Industrials'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'S&P 500 Communication Services'`);
        await queryRunner.query(`update "${schema}"."${tableName}" set "builtIn" = true where name = 'Most Actives & Gainers & Losers Auto Added'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
