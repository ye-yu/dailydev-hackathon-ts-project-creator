import { createServer } from "node:http";
import { router } from "./router.ts";
import "./health/health.router.ts";
import "./blog/blog.router.ts";
import { PrefixedLogger } from "./logger/logger.ts";

const console = new PrefixedLogger(import.meta.url);

export async function startAPIServer(port: number): Promise<void> {
  const { resolve, reject, promise } = Promise.withResolvers<void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const server = createServer(router.handle.bind(router) as any);
  server.listen(port, resolve);
  server.on("error", reject);
  await promise;
  console.once(`API server is running on port ${port}`);
}
