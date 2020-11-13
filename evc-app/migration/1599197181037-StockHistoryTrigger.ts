import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskHistoryTrigger1599197181037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION function_stock_history()
        RETURNS trigger AS
        $BODY$
        BEGIN
            INSERT INTO stock_history (symbol, "createdAt", company, market, "peLo", "peHi", value, "supportPriceLo", "supportPriceHi", "pressurePriceLo", "pressurePriceHi", "by", "isPublished")
            VALUES (NEW.symbol, NEW."createdAt", NEW.company, NEW.market, NEW."peLo", NEW."peHi", NEW.value, NEW."supportPriceLo", NEW."supportPriceHi", NEW."pressurePriceLo", NEW."pressurePriceHi", NEW."by", NEW."isPublished");
            RETURN NULL;
        END;
        $BODY$
        LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
        CREATE TRIGGER stock_history_trigger AFTER INSERT OR UPDATE ON stock
        FOR EACH ROW EXECUTE PROCEDURE function_stock_history();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
