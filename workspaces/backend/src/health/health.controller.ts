import { HttpResponse } from "../platform/http-response.ts";
import type { HttpMiddleware } from "../platform/http-router.ts";
import { getDailyDevHealth } from "./heatlh.service.ts";

export const getHealth: HttpMiddleware = async (_, __, next) => {
  const isDailyDevHealthy = await getDailyDevHealth();
  const response = HttpResponse.ok({
    status: isDailyDevHealthy ? "ok" : "degraded",
    dailyDev: {
      reachable: isDailyDevHealthy,
    },
  });
  next(response);
};
