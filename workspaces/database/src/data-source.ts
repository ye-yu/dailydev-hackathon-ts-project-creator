import "reflect-metadata";
import { DataSource } from "typeorm";
import { resolve } from "path";
import { Users } from "./entities/Users";
import { BlogPost } from "./entities/BlogPost";
import { BlogFile } from "./entities/BlogFile";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: resolve(__dirname, "../data/database.sqlite"),
  synchronize: true,
  logging: false,
  entities: [Users, BlogPost, BlogFile],
  migrations: [resolve(__dirname, "./migrations/**.{ts,js}")],
  subscribers: [],
});
