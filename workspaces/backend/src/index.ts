import { setDailyDevConfig } from "@ye-yu/shared/daily-dev";
import { loadEnv, getEnv } from "./config.ts";
import { parseArgs } from "node:util";
import { PrefixedLogger } from "./logger/logger.ts";
import { AppDataSource } from "@ye-yu/database/data-source";
import { setGitServerDataSource } from "./git/git.server.ts";
import { startAPIServer } from "./server.ts";
const console = new PrefixedLogger(import.meta.url);

const { values } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: false,
  options: {
    env: {
      type: "string",
      short: "e",
      default: "development",
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
});

const helpMessage = `Usage: npm start -- --env <environment>

Options:
  --env, -e    Set the environment (development, production, test) (default: development)
`;

if (values.help) {
  console.info(helpMessage);
  process.exit(0);
}

const env = values.env;

function isAllowedEnv(env: string): env is "development" | "production" | "test" {
  return ["development", "production", "test"].includes(env);
}

if (!isAllowedEnv(env)) {
  console.error(`Invalid environment: ${env}`);
  console.info(helpMessage);
  process.exit(1);
}

await loadEnv(env);
const config = getEnv();
setDailyDevConfig(config.DAILY_DEV_BASE_URL, config.DAILY_DEV_API_KEY);

await AppDataSource.initialize();
setGitServerDataSource(AppDataSource);
await startAPIServer(config.API_SERVER_PORT);
