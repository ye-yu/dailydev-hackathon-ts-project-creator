import { HttpResponse } from "../platform/http-response.ts";
import type { HttpMiddleware } from "../platform/http-router.ts";

export const getHealth: HttpMiddleware = (_, __, next) => {
  const response = HttpResponse.ok({ status: "ok" });
  next(response);
};
