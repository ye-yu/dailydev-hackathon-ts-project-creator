export type Env = {
  NODE_ENV: 'development' | 'production' | 'test'
  DAILY_DEV_BASE_URL: string
  DAILY_DEV_API_KEY: string
  HTTP_ALLOW_ORIGIN: string
  NODE_TLS_REJECT_UNAUTHORIZED: string
  API_SERVER_PORT: number
}
