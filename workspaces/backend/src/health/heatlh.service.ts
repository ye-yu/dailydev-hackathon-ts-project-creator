import { createDailyDevRequestInit } from "@ye-yu/shared/daily-dev";
import { PrefixedLogger } from "../logger/logger.ts";
import { createCurlCommand } from "@ye-yu/shared/utils";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const console = new PrefixedLogger(import.meta.url);
const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const sqliteDbPath = resolve(scriptDir, "../../../database/data/database.sqlite");

export async function getDailyDevHealth(): Promise<boolean> {
  const { url, ...request } = createDailyDevRequestInit("GetCurrentUserSProfile", "get");

  try {
    const result = await fetch(url, request, true);
    switch (result.status) {
      case 200:
        const response = await result.json();
        console.once(`Daily.dev health check status: ${result.status}. Hello: ${response.name}`);
        return result.status === 200;
        break;
      case 401:
        console.warn("Daily.dev health check failed: Unauthorized. Please check your API key.");
        return false;
      default:
        console.warn(`Daily.dev health check returned unexpected status: ${result.status}`);
        return false;
    }
  } catch (error) {
    console.error("Error checking Daily.dev health:", error);
    if (error !== null && typeof error === "object" && "stack" in error) {
      console.line(...`${error.stack}`.split("\n"));
    }
    const curl = createCurlCommand(url, request);
    console.error(`cURL command for debugging: ${curl}`);
    return false;
  }
}

export async function getSqliteHealth(): Promise<boolean> {
  try {
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(sqliteDbPath, { open: true, readOnly: true });
    db.prepare("SELECT 1").get();
    db.close();
    return true;
  } catch (error) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ERR_UNKNOWN_BUILTIN_MODULE"
    ) {
      try {
        await access(sqliteDbPath, constants.R_OK);
        return true;
      } catch {
        console.error("SQLite health check failed (fallback file check):", sqliteDbPath);
        return false;
      }
    }

    console.error("SQLite health check failed:", error);
    return false;
  }
}
