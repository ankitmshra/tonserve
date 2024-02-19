import { MigrationInterface, QueryRunner } from "typeorm";

export class Fulfillmentshipping1708157208081 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE \"fulfillment\"" + 
            " ADD COLUMN \"label\" text"
          )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE \"fulfillment\" DROP COLUMN \"label\""
          )    
    }

}
