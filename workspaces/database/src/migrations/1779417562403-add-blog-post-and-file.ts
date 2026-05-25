import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBlogPostAndFile1779417562403 implements MigrationInterface {
  name = 'AddBlogPostAndFile1779417562403'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blog_file" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "path" varchar NOT NULL, "content" text NOT NULL, "postId" varchar NOT NULL)`,
    )
    await queryRunner.query(
      `CREATE TABLE "blog_post" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "timestamp" varchar NOT NULL, "author" varchar NOT NULL, "tags" text NOT NULL, "description" varchar NOT NULL, "content" text NOT NULL, "gitUrl" varchar NOT NULL)`,
    )
    await queryRunner.query(
      `CREATE TABLE "temporary_blog_file" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "path" varchar NOT NULL, "content" text NOT NULL, "postId" varchar NOT NULL, CONSTRAINT "FK_6365d2ffb3beedf1b886a81c4e7" FOREIGN KEY ("postId") REFERENCES "blog_post" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    )
    await queryRunner.query(
      `INSERT INTO "temporary_blog_file"("id", "path", "content", "postId") SELECT "id", "path", "content", "postId" FROM "blog_file"`,
    )
    await queryRunner.query(`DROP TABLE "blog_file"`)
    await queryRunner.query(`ALTER TABLE "temporary_blog_file" RENAME TO "blog_file"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog_file" RENAME TO "temporary_blog_file"`)
    await queryRunner.query(
      `CREATE TABLE "blog_file" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "path" varchar NOT NULL, "content" text NOT NULL, "postId" varchar NOT NULL)`,
    )
    await queryRunner.query(
      `INSERT INTO "blog_file"("id", "path", "content", "postId") SELECT "id", "path", "content", "postId" FROM "temporary_blog_file"`,
    )
    await queryRunner.query(`DROP TABLE "temporary_blog_file"`)
    await queryRunner.query(`DROP TABLE "blog_post"`)
    await queryRunner.query(`DROP TABLE "blog_file"`)
  }
}
