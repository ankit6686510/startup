import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyFeatures1770294150669 implements MigrationInterface {
    name = 'AddCompanyFeatures1770294150669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_members_role_enum') THEN CREATE TYPE "public"."startup_members_role_enum" AS ENUM('OWNER', 'ADMIN', 'RECRUITER', 'EDITOR', 'VIEWER'); END IF; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "startup_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startup_id" uuid NOT NULL, "user_id" character varying NOT NULL, "role" "public"."startup_members_role_enum" NOT NULL DEFAULT 'VIEWER', "permissions" jsonb, "isActive" boolean NOT NULL DEFAULT true, "invitedBy" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6e5815493f0c1db9ffd956da2e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fb4ba113dd88729e3c538a1430" ON "startup_members" ("startup_id", "user_id") `);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_posts_type_enum') THEN CREATE TYPE "public"."startup_posts_type_enum" AS ENUM('UPDATE', 'MILESTONE', 'JOB_HIGHLIGHT', 'ARTICLE', 'POLL'); END IF; END $$`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_posts_visibility_enum') THEN CREATE TYPE "public"."startup_posts_visibility_enum" AS ENUM('PUBLIC', 'INVESTORS_ONLY', 'TEAM_ONLY'); END IF; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "startup_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startup_id" uuid NOT NULL, "author_id" character varying NOT NULL, "content" text NOT NULL, "mediaUrls" text, "type" "public"."startup_posts_type_enum" NOT NULL DEFAULT 'UPDATE', "visibility" "public"."startup_posts_visibility_enum" NOT NULL DEFAULT 'PUBLIC', "likesCount" integer NOT NULL DEFAULT '0', "commentsCount" integer NOT NULL DEFAULT '0', "isPinned" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e3496e48221597e5e3df32ef97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_3a716e2a5e6f0ec83bbe65c2df" ON "startup_posts" ("startup_id") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_87782fcf579d185562c8b9ae01" ON "startup_posts" ("visibility") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_838528ce307df6deda9827a57d" ON "startup_posts" ("created_at") `);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_financials_type_enum') THEN CREATE TYPE "public"."startup_financials_type_enum" AS ENUM('QUARTERLY', 'ANNUAL', 'MONTHLY', 'OTHER'); END IF; END $$`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_financials_accesslevel_enum') THEN CREATE TYPE "public"."startup_financials_accesslevel_enum" AS ENUM('PUBLIC', 'VERIFIED_INVESTOR', 'PRIVATE'); END IF; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "startup_financials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startup_id" uuid NOT NULL, "title" character varying NOT NULL, "period_start" TIMESTAMP NOT NULL, "period_end" TIMESTAMP NOT NULL, "type" "public"."startup_financials_type_enum" NOT NULL, "revenue" numeric(15,2), "burnRate" numeric(15,2), "netIncome" numeric(15,2), "cashOp" numeric(15,2), "currency" character varying, "document_url" character varying, "accessLevel" "public"."startup_financials_accesslevel_enum" NOT NULL DEFAULT 'PRIVATE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d09d229a7864a45e0a6036e212" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_4b3ba33d49ce770db69dd4c41a" ON "startup_financials" ("startup_id") `);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_milestones_type_enum') THEN CREATE TYPE "public"."startup_milestones_type_enum" AS ENUM('FOUNDING', 'FUNDING', 'PRODUCT_LAUNCH', 'USER_GROWTH', 'ACQUISITION', 'AWARD', 'OTHER'); END IF; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "startup_milestones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startup_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "date" date NOT NULL, "type" "public"."startup_milestones_type_enum" NOT NULL DEFAULT 'OTHER', "imageUrl" character varying, "isVisible" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_daa62b8ad261daa251e7a14bc80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_5508741f4e18e469182343c65d" ON "startup_milestones" ("startup_id", "date") `);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_dc61d59086fd7022ea67251b171') THEN ALTER TABLE "startup_members" ADD CONSTRAINT "FK_dc61d59086fd7022ea67251b171" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_3a716e2a5e6f0ec83bbe65c2df7') THEN ALTER TABLE "startup_posts" ADD CONSTRAINT "FK_3a716e2a5e6f0ec83bbe65c2df7" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_4b3ba33d49ce770db69dd4c41a2') THEN ALTER TABLE "startup_financials" ADD CONSTRAINT "FK_4b3ba33d49ce770db69dd4c41a2" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_8ac56a8393ece1976b2e0acefed') THEN ALTER TABLE "startup_milestones" ADD CONSTRAINT "FK_8ac56a8393ece1976b2e0acefed" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "startup_milestones" DROP CONSTRAINT "FK_8ac56a8393ece1976b2e0acefed"`);
        await queryRunner.query(`ALTER TABLE "startup_financials" DROP CONSTRAINT "FK_4b3ba33d49ce770db69dd4c41a2"`);
        await queryRunner.query(`ALTER TABLE "startup_posts" DROP CONSTRAINT "FK_3a716e2a5e6f0ec83bbe65c2df7"`);
        await queryRunner.query(`ALTER TABLE "startup_members" DROP CONSTRAINT "FK_dc61d59086fd7022ea67251b171"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5508741f4e18e469182343c65d"`);
        await queryRunner.query(`DROP TABLE "startup_milestones"`);
        await queryRunner.query(`DROP TYPE "public"."startup_milestones_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b3ba33d49ce770db69dd4c41a"`);
        await queryRunner.query(`DROP TABLE "startup_financials"`);
        await queryRunner.query(`DROP TYPE "public"."startup_financials_accesslevel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."startup_financials_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_838528ce307df6deda9827a57d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87782fcf579d185562c8b9ae01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a716e2a5e6f0ec83bbe65c2df"`);
        await queryRunner.query(`DROP TABLE "startup_posts"`);
        await queryRunner.query(`DROP TYPE "public"."startup_posts_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."startup_posts_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb4ba113dd88729e3c538a1430"`);
        await queryRunner.query(`DROP TABLE "startup_members"`);
        await queryRunner.query(`DROP TYPE "public"."startup_members_role_enum"`);
    }

}
