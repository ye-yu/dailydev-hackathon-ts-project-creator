import { createDailyDevRequestInit } from "@ye-yu/shared/daily-dev";
import { PrefixedLogger } from "../logger/logger.ts";
import { createCurlCommand } from "@ye-yu/shared/utils";

const console = new PrefixedLogger(import.meta.url);

export async function getDailyDevHealth(): Promise<boolean> {
  const { url, ...request } = createDailyDevRequestInit("GetCurrentUserSProfile", "get");

  try {
    const result = await fetch(url, request, true);
    console.once(`Daily.dev health check status: ${result.status}`);
    return result.status === 200;
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
