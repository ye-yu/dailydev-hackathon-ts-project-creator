import "reflect-metadata";
import { DataSource } from "typeorm";
import { resolve } from "path";
import { Users } from "./entities/Users";
import { BlogPost } from "./entities/BlogPost";
import { BlogFile } from "./entities/BlogFile";
import { DailyDevFetchState } from "./entities/DailyDevFetchState";

export const TestDataSource = new DataSource({
  type: "better-sqlite3",
  database: ":memory:",
  synchronize: true,
  logging: false,
  entities: [Users, BlogPost, BlogFile, DailyDevFetchState],
  migrations: [resolve(__dirname, "./migrations/**.{ts,js}")],
  subscribers: [],
});
