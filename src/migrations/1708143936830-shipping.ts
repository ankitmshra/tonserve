import { MigrationInterface, QueryRunner } from "typeorm";

export class Shipping1708143936830 implements MigrationInterface {
    name = 'Shipping1708143936830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shipping" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "label" character varying NOT NULL, "trackingurl" character varying, "fulfillment" character varying NOT NULL, CONSTRAINT "PK_0dc6ac92ee9cbc2c1611d77804c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "shipping"`);
    }

}
