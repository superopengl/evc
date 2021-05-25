import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { Config } from '../src/entity/Config';

export class AddUsdToCnyExchangeRate1621910546999 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const config = new Config();
        config.key = 'pricing.usdToCnyExchangeRate'
        config.value = '6.8';
        await getRepository(Config).insert(config);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
