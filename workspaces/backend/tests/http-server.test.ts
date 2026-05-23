import { after, describe, it } from "node:test";
import { createRouter, type HttpMiddleware } from "../src/platform/http-router.ts";
import assert from "node:assert";
import { createServer } from "node:http";
import { HttpError } from "../src/platform/http-errors.ts";
import { HttpResponse } from "../src/platform/http-response.ts";

const router = createRouter();

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const ensureParamType = (paramName: string, type: Function): HttpMiddleware => {
  const currentErrorAsCause = new Error(
    `Expected parameter "${paramName}" to be of type ${type.name}`,
  );
  return (req, _, next) => {
    const paramValue = req.params?.[paramName];
    if (paramValue === undefined) {
      const error = new HttpError(400, `Missing parameter "${paramName}"`, currentErrorAsCause);
      return next(error);
    }
    switch (type) {
      case Number:
        const parsedValue = Number(paramValue);
        if (isNaN(parsedValue)) {
          const error = new HttpError(
            400,
            `Invalid parameter "${paramName}"`,
            currentErrorAsCause,
            { value: paramValue },
          );
          next(error);
          return;
        }
        break;
      case Boolean: {
        if (paramValue !== "true" && paramValue !== "false") {
          const error = new HttpError(
            400,
            `Invalid parameter "${paramName}"`,
            currentErrorAsCause,
            { value: paramValue },
          );
          next(error);
          return;
        }
        break;
      }
    }

    next();
  };
};

router.use("/users/:id", ensureParamType("id", Number));

router.get("/users/:id/hello", (req, res, next) => {
  next(new HttpResponse(200, `User ID: ${req.params?.id}`));
});

const { resolve, reject, promise } = Promise.withResolvers<void>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const server = createServer(router.handle.bind(router) as any);
server.listen(3000, resolve);
server.on("error", reject);
await promise;

describe("HTTP Server", () => {
  it('should respond with "User ID: 123" for GET /users/123/hello', async () => {
    const response = await fetch("http://localhost:3000/users/123/hello");
    const text = await response.text();
    assert.strictEqual(response.status, 200, `Expected status 200, got ${response.status}`);
    assert.strictEqual(text, "User ID: 123", `Expected response "User ID: 123", got "${text}"`);
  });

  it("should respond with an error for GET /users/abc/hello", async () => {
    const response = await fetch("http://localhost:3000/users/abc/hello");
    assert.strictEqual(response.status, 400, `Expected status 400, got ${response.status}`);
  });

  after(async () => {
    const { resolve, reject, promise } = Promise.withResolvers<void>();
    console.log("Tests completed, shutting down server...");
    server.close((err: unknown) => (err ? reject(err) : resolve()));
    await promise;
  });
});
