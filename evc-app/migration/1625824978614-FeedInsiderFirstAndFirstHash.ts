import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import { StockInsiderTransaction } from '../src/entity/StockInsiderTransaction';
import { StockInsiderTransactionPreviousSnapshot } from '../src/entity/StockInsiderTransactionPreviousSnapshot';
import * as objHash from 'object-hash';

export class FeedInsiderFirstAndFirstHash1625824978614 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const preList = await queryRunner.manager.find(StockInsiderTransactionPreviousSnapshot, {});
        const curList = await queryRunner.manager.find(StockInsiderTransaction, {});
        const list = [...preList, ...curList];
        list.forEach(x => {
            const first = x.value[0];
            x.first = first;
            x.firstHash = objHash(first || {});
        });
        await queryRunner.manager.save(list);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
