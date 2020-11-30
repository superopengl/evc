import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminUser1596415746494 implements MigrationInterface {

    // Initial password is 'admin'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public."user_profile" (id, "email", "givenName", "surname", country) 
        VALUES (
        'c576cbb7-793c-4113-8e74-e44f0eb7d261',
        'admin@easyvaluecheck.com', 
        'System',
        'Admin',
        'NZ'
        )`);

        await queryRunner.query(`INSERT INTO public."user" ("emailHash", secret, salt, role, "profileId") 
        VALUES (
        'a80d3e0e-f27a-50d7-b7b0-06e4818a212b', 
        'bf1d03be616a88a42b0af835f5f0bf69f51d879534e1b33af91765fd6a935cd3', 
        '00000000-f200-485b-ad4f-90b530bdd4a4', 
        'admin',
        'c576cbb7-793c-4113-8e74-e44f0eb7d261'
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
