import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { StockTag } from '../src/entity/StockTag';

export class StockTagSortGroup1616934873920 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const {schema, tableName} = getRepository(StockTag).metadata;
        for(const data of stockTags) {
            await queryRunner.query(`update "${schema}"."${tableName}" set "sortGroup" = $2 where name = $1`, [data.name, data.sort]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}

const stockTags = [
    {
        name: 'S&P 500',
        sort: 101,
    },
    {
        name: 'Dow Jones 30',
        sort: 102,
    },
    {
        name: 'Nasdaq 100',
        sort: 103,
    },
    {
        name: 'Nasdaq Composite',
        sort: 104,
    },
    {
        name: 'Russell 2000',
        sort: 105,
    },
    {
        name: 'S&P 100',
        sort: 201,
    },
    {
        name: 'S&P 400',
        sort: 202,
    },
    {
        name: 'Russell 1000',
        sort: 203,
    },
    {
        name: 'Russell 3000',
        sort: 204,
    },
    {
        name: 'S&P 500 Information Technology',
        sort: 301,
    },
    {
        name: 'S&P 500 Consumer Discretionary',
        sort: 302,
    },
    {
        name: 'S&P 500 Consumer Staples',
        sort: 303,
    },
    {
        name: 'S&P 500 Energies',
        sort: 304,
    },
    {
        name: 'S&P 500 Financials',
        sort: 305,
    },
    {
        name: 'S&P 500 Health Care',
        sort: 306,
    },
    {
        name: 'S&P 500 Industrials',
        sort: 307,
    },
    {
        name: 'S&P 500 Materials',
        sort: 308,
    },
    {
        name: 'S&P 500 Real Estate',
        sort: 309,
    },
    {
        name: 'S&P 500 Utilities',
        sort: 310,
    },
    {
        name: 'S&P 500 Communication Services',
        sort: 311,
    }
];