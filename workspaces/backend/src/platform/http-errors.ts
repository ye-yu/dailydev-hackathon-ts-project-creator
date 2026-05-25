import { HttpResponse } from './http-response.ts'

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HttpError extends Error implements HttpResponse {
  statusCode: number
  details?: any
  body?: any
  headers: Record<string, string>

  constructor(
    statusCode: number,
    message: string,
    details?: any,
    body?: any,
    headers: Record<string, string> = {},
  ) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.body = body
    this.headers = headers
  }

  reply(res: any): void {
    return HttpResponse.prototype.reply.call(this, res)
  }
}
