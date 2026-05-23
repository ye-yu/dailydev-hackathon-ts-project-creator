import { setDailyDevConfig } from "@ye-yu/shared/daily-dev";
import { loadEnv, getEnv } from "./config.ts";
import { parseArgs } from "node:util";
import { createServer } from "node:http";
import { router } from "./router.ts";
import "./health/health.router.ts";
import { PrefixedLogger } from "./logger/logger.ts";
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
const { resolve, reject, promise } = Promise.withResolvers<void>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const server = createServer(router.handle.bind(router) as any);
server.listen(3000, resolve);
server.on("error", reject);
await promise;
console.once(`Server is running in ${config.NODE_ENV} mode on port 3000`);
