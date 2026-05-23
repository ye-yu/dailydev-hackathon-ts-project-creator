import { HttpResponse } from "../platform/http-response.ts";
import type { HttpMiddleware } from "../platform/http-router.ts";
import { getDailyDevHealth, getSqliteHealth } from "./heatlh.service.ts";

export const getHealth: HttpMiddleware = async (_, __, next) => {
  const isDailyDevHealthy = await getDailyDevHealth();
  const isSqliteHealthy = await getSqliteHealth();
  const isHealthy = isDailyDevHealthy && isSqliteHealthy;
  const response = HttpResponse.ok({
    status: isHealthy ? "ok" : "degraded",
    dailyDev: {
      reachable: isDailyDevHealthy,
    },
    sqlite: {
      reachable: isSqliteHealthy,
    },
  });
  next(response);
};
