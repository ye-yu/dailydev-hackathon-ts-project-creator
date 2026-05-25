import type { ServerResponse } from 'node:http'

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HttpResponse {
  statusCode: number
  headers: Record<string, string>
  body?: any

  constructor(statusCode: number, body: any = null, headers: Record<string, string> = {}) {
    this.statusCode = statusCode
    this.body = body
    this.headers = headers
  }

  reply(res: ServerResponse): void {
    res.statusCode = this.statusCode
    for (const [key, value] of Object.entries(this.headers)) {
      res.setHeader(key, value)
    }
    if (this.body !== undefined && this.body !== null) {
      if (typeof this.body === 'object') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(this.body))
      } else {
        res.end(String(this.body))
      }
    } else {
      res.end()
    }
  }

  static ok(body: any = null, headers: Record<string, string> = {}) {
    return new HttpResponse(200, body, headers)
  }
}
