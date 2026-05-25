/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrefixedLogger } from '@ye-yu/shared/logger'
import { ExtendedMap, PatternMap } from './pattern-map.ts'

const console = new PrefixedLogger(import.meta.url)

type Middleware = (req: any, res: any, next: (err?: any) => void) => void
type ErrorMiddleware = (err: any, req: any, res: any, next: (err?: any) => void) => void

export type Methods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
type middlewareRegisterer<TMiddleware = Middleware, EMiddleware = ErrorMiddleware> = {
  (path: string, ...middlewares: EMiddleware[]): void
  (path: string, ...middlewares: TMiddleware[]): void
}

const emptyMap = new PatternMap<any>()

export class Router<TMiddleware = Middleware, EMiddleware = ErrorMiddleware> implements Record<
  Methods,
  middlewareRegisterer<TMiddleware, EMiddleware>
> {
  isMiddleware(middleware: any): middleware is TMiddleware {
    return typeof middleware === 'function' && (middleware as () => void).length === 3
  }

  isErrorMiddleware(middleware: any): middleware is EMiddleware {
    return typeof middleware === 'function' && (middleware as () => void).length === 4
  }

  *getPathSegmentsForUse(path: string): Generator<string> {
    const segments = path.split('/')
    for (let i = 0; i < segments.length; i++) {
      const candidate = segments.slice(0, i + 1).join('/')
      yield candidate
    }
  }

  *getHandlersFromProvided<T>(
    method: Methods,
    path: string,
    middlewaresOfUse: PatternMap<T[]>,
    methodsToMiddlewares: ExtendedMap<Methods, PatternMap<T[]>>,
    middlewaresOfAfter: PatternMap<T[]>,
  ): Generator<{
    pattern: string
    handler: T[]
  }> {
    const pathSegmentsForUse = this.getPathSegmentsForUse(path)
    for (const segments of pathSegmentsForUse) {
      const matchingMiddlewaresOfUse = middlewaresOfUse.getCandidates(segments)
      for (const [pattern, middlewares] of matchingMiddlewaresOfUse) {
        yield { pattern, handler: middlewares }
      }
    }

    const middlewaresOfMethod = methodsToMiddlewares.getOrInsertComputed(
      method,
      () => emptyMap as PatternMap<T[]>,
    )

    const candidates = middlewaresOfMethod.getCandidates(path)
    for (const [pattern, middlewares] of candidates) {
      yield { pattern, handler: middlewares }
    }

    for (const segments of this.getPathSegmentsForUse(path)) {
      const matchingMiddlewaresOfAfter = middlewaresOfAfter.getCandidates(segments)
      for (const [pattern, middlewares] of matchingMiddlewaresOfAfter) {
        yield { pattern, handler: middlewares }
      }
    }
  }

  *getHandlers(
    method: Methods,
    path: string,
  ): Generator<{
    pattern: string
    handler: TMiddleware[]
  }> {
    yield* this.getHandlersFromProvided(
      method,
      path,
      this.middlewaresOfUse,
      this.methodsToMiddlewares,
      this.middlewaresOfAfter,
    )
  }

  *getErrorHandlers(
    method: Methods,
    path: string,
  ): Generator<{
    pattern: string
    handler: EMiddleware[]
  }> {
    yield* this.getHandlersFromProvided(
      method,
      path,
      this.errorMiddlewaresOfUse,
      this.methodsToErrorMiddlewares,
      this.errorMiddlewaresOfAfter,
    )
  }

  middlewaresOfUse = new PatternMap<TMiddleware[]>()
  methodsToMiddlewares = new ExtendedMap<Methods, PatternMap<TMiddleware[]>>()

  errorMiddlewaresOfUse = new PatternMap<EMiddleware[]>()
  methodsToErrorMiddlewares = new ExtendedMap<Methods, PatternMap<EMiddleware[]>>()

  middlewaresOfAfter = new PatternMap<TMiddleware[]>()
  errorMiddlewaresOfAfter = new PatternMap<EMiddleware[]>()

  use(path: string, ...middlewares: TMiddleware[]): void
  use(path: string, ...middlewares: EMiddleware[]): void
  use(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    console.once(`Registering route: [use] ${path}`)
    const tmiddlewares = middlewares.filter((middleware) => this.isMiddleware(middleware))
    const emiddlewares = middlewares.filter((middleware) => this.isErrorMiddleware(middleware))

    this.middlewaresOfUse.getOrInsertComputed(path, () => []).push(...tmiddlewares)

    this.errorMiddlewaresOfUse.getOrInsertComputed(path, () => []).push(...emiddlewares)
  }

  after(path: string, ...middlewares: TMiddleware[]): void
  after(path: string, ...middlewares: EMiddleware[]): void
  after(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    const tmiddlewares = middlewares.filter((middleware) => this.isMiddleware(middleware))
    const emiddlewares = middlewares.filter((middleware) => this.isErrorMiddleware(middleware))

    this.middlewaresOfAfter.getOrInsertComputed(path, () => []).push(...tmiddlewares)

    this.errorMiddlewaresOfAfter.getOrInsertComputed(path, () => []).push(...emiddlewares)
  }

  apply(method: Methods, path: string, ...middlewares: (TMiddleware | EMiddleware)[]) {
    console.once(`Registering route: [${method.toUpperCase()}] ${path}`)
    const tmiddlewares = middlewares.filter((e) => this.isMiddleware(e))
    const emiddlewares = middlewares.filter((e) => this.isErrorMiddleware(e))

    this.methodsToMiddlewares
      .getOrInsertComputed(method, () => new PatternMap())
      .getOrInsertComputed(path, () => [])
      .push(...tmiddlewares)

    this.methodsToErrorMiddlewares
      .getOrInsertComputed(method, () => new PatternMap())
      .getOrInsertComputed(path, () => [])
      .push(...emiddlewares)
  }

  get(path: string, ...middlewares: TMiddleware[]): void
  get(path: string, ...middlewares: EMiddleware[]): void
  get(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('get', path, ...middlewares)
  }

  post(path: string, ...middlewares: TMiddleware[]): void
  post(path: string, ...middlewares: EMiddleware[]): void
  post(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('post', path, ...middlewares)
  }

  put(path: string, ...middlewares: TMiddleware[]): void
  put(path: string, ...middlewares: EMiddleware[]): void
  put(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('put', path, ...middlewares)
  }

  delete(path: string, ...middlewares: TMiddleware[]): void
  delete(path: string, ...middlewares: EMiddleware[]): void
  delete(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('delete', path, ...middlewares)
  }

  patch(path: string, ...middlewares: TMiddleware[]): void
  patch(path: string, ...middlewares: EMiddleware[]): void
  patch(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('patch', path, ...middlewares)
  }

  options(path: string, ...middlewares: TMiddleware[]): void
  options(path: string, ...middlewares: EMiddleware[]): void
  options(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('options', path, ...middlewares)
  }

  head(path: string, ...middlewares: TMiddleware[]): void
  head(path: string, ...middlewares: EMiddleware[]): void
  head(path: string, ...middlewares: (TMiddleware | EMiddleware)[]): void {
    this.apply('head', path, ...middlewares)
  }

  extractParams(path: string, pattern: string): Record<string, string> {
    const pathSegments = path.split('/')
    const patternSegments = pattern.split('/')

    const params: Record<string, string> = {}
    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i]
      if (patternSegment.startsWith(':')) {
        const paramName = patternSegment.slice(1)
        params[paramName] = pathSegments[i]
      }
    }

    return params
  }
}
