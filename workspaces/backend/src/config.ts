import type { Env } from "./env.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const scriptDir = fileURLToPath(new URL(".", import.meta.url));

let env: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  DAILY_DEV_BASE_URL: process.env.DAILY_DEV_BASE_URL || "",
  DAILY_DEV_API_KEY: process.env.DAILY_DEV_API_KEY || "",
  HTTP_ALLOW_ORIGIN: process.env.HTTP_ALLOW_ORIGIN || "",
  NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || "1",
};

export async function loadEnv(nodeEnv: "development" | "production" | "test") {
  const expectedPath = path.join(scriptDir, `./env.${nodeEnv}.ts`);
  try {
    env = await import(pathToFileURL(expectedPath).toString()).then((e) => e.default);
  } catch (error) {
    console.error(
      `Could not load environment variables for ${nodeEnv}. Please fill in the environment variables manually in ${expectedPath}`,
      error,
    );
    fs.writeFileSync(
      expectedPath,
      [
        `import type { Env } from "./env.ts";`,
        ``,
        `const env: Env = {`,
        `  NODE_ENV: "${nodeEnv}",`,
        `  DAILY_DEV_BASE_URL: "",`,
        `  DAILY_DEV_API_KEY: "",`,
        `  HTTP_ALLOW_ORIGIN: "",`,
        `};`,
        ``,
        `export default env`,
      ].join("\n"),
    );
  }
}

export function getEnv() {
  return env;
}
