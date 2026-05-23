/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { type Methods, Router } from "./router.ts";
import { HttpResponse } from "./http-response.ts";
import { HttpError } from "./http-errors.ts";
import { PrefixedLogger } from "@ye-yu/shared/logger";

const console = new PrefixedLogger(import.meta.url);

type ServerRequest = IncomingMessage & {
  params?: Record<string, string>;
  query?: Record<string, string>;
};

export type HttpMiddleware = (
  req: ServerRequest,
  res: ServerResponse,
  next: (err?: any) => void,
) => void | Promise<void>;
export type ErrorHttpMiddleware = (
  err: any,
  req: ServerRequest,
  res: ServerResponse,
  next: (err?: any) => void,
) => void | Promise<void>;

export class HttpRouter<
  TRequest extends { method?: string; url?: string } = IncomingMessage,
  TResponse extends { statusCode: number; end: (resp?: any) => void; writableEnded: boolean } =
    ServerResponse,
> extends Router<HttpMiddleware, ErrorHttpMiddleware> {
  handle(req: TRequest, res: TResponse): Promise<void> {
    return handleRequest(this, req, res);
  }

  listen(port: number, callback?: () => void): void {
    const server = createServer(this.handle.bind(this) as any);
    server.listen(port, callback);
  }
}

export function createRouter() {
  const router = new HttpRouter();
  return router;
}

export class WrappedError extends Error {
  declare cause: { error: any; previousError?: WrappedError };
}

export function wrapError(newError?: any, oldError?: Error): Error {
  if (!oldError) {
    return newError instanceof Error ? newError : new Error(String(newError));
  }

  if (!(newError instanceof Error)) {
    return new WrappedError(`${newError}`, {
      cause: { error: newError as unknown, previousError: oldError },
    });
  }

  if (!newError.cause) {
    newError.cause = oldError;
    return newError;
  }

  return new WrappedError(`${newError}`, {
    cause: { error: newError, previousError: oldError },
  });
}

export async function handleRequest<
  TRequest extends { method?: string; url?: string } = IncomingMessage,
  TResponse extends { statusCode: number; end: (resp?: any) => void; writableEnded: boolean } =
    ServerResponse,
>(router: HttpRouter<TRequest, TResponse>, req: TRequest, res: TResponse): Promise<void> {
  const { method = "", url = "" } = req;

  const methodLower = method.toLowerCase() as unknown as Methods;

  const asUrlObject = URL.parse(url, "http://dummy/");
  if (!asUrlObject) {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  const path = asUrlObject.pathname || "/";
  const params: Record<string, string> = {};
  const query = Object.freeze(Object.fromEntries(asUrlObject.searchParams.entries()));
  Object.defineProperty(req, "params", {
    value: params,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Object.defineProperty(req, "query", {
    value: query,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  const enrichedReq = req as unknown as ServerRequest;

  let error: Error | undefined;

  const handlers = router.getHandlers(methodLower, url);
  handlerLoop: for (const { pattern, handler } of handlers) {
    const paramsFromPattern = router.extractParams(path, pattern);
    Object.assign(params, paramsFromPattern);
    for (const _middleware of handler) {
      const middleware = _middleware as HttpMiddleware;
      try {
        // note: only resolve when next is called, even if the middleware is a promise
        await new Promise<void>((resolve, reject) => {
          const maybePromise = middleware(enrichedReq, res as unknown as any, (err: any) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });

          if (maybePromise instanceof Promise) {
            maybePromise
              // .then(resolve) // do we need to resolve?
              .catch(reject);
          }
        });
        if (error) {
          break handlerLoop;
        }
      } catch (err) {
        if (err instanceof HttpResponse || err instanceof HttpError) {
          err.reply(res as any);
          return;
        }
        error = wrapError(err, error);
        break handlerLoop;
      }
    }
    if (error) {
      break handlerLoop;
    }
  }

  if (error) {
    const errorHandlers = router.getErrorHandlers(methodLower, url);
    for (const { pattern, handler } of errorHandlers) {
      const paramsFromPattern = router.extractParams(path, pattern);
      Object.assign(params, paramsFromPattern);
      for (const _middleware of handler) {
        const middleware = _middleware as ErrorHttpMiddleware;
        try {
          // note: only resolve when next is called, even if the middleware is a promise
          await new Promise<void>((resolve, reject) => {
            const maybePromise = middleware(error, enrichedReq, res as unknown as any, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });

            if (maybePromise instanceof Promise) {
              maybePromise
                // .then(resolve) // do we need to resolve?
                .catch(reject);
            }
          });
        } catch (err) {
          if (err instanceof HttpResponse || err instanceof HttpError) {
            err.reply(res as any);
            return;
          }

          error = wrapError(err, error);
          break;
        }
      }
    }
  }

  if (res.writableEnded) return;
  if (error) {
    console.debug("Error occurred but writes have not ended, sending 500 response", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
}
