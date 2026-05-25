import { createDailyDevRequestInit } from '@ye-yu/shared/daily-dev'
import { PrefixedLogger } from '@ye-yu/shared/logger'
import { createCurlCommand } from '@ye-yu/shared/utils'
import { AppDataSource } from '@ye-yu/database/data-source'

const console = new PrefixedLogger(import.meta.url)

export async function getDailyDevHealth(): Promise<boolean> {
  let curlCommandTry = ""
  try {
    const { url, ...request } = createDailyDevRequestInit('GetCurrentUserSProfile', 'get')
    curlCommandTry = createCurlCommand(url, request)
    const result = await fetch(url, request, true)
    switch (result.status) {
      case 200:
        const response = await result.json()
        console.once(`Daily.dev health check status: ${result.status}. Hello: ${response.name}`)
        return result.status === 200
        break
      case 401:
        console.warn('Daily.dev health check failed: Unauthorized. Please check your API key.')
        return false
      default:
        console.warn(`Daily.dev health check returned unexpected status: ${result.status}`)
        return false
    }
  } catch (error) {
    console.error('Error checking Daily.dev health:', error)
    console.error(`cURL command for debugging: ${curlCommandTry}`)
    if (error !== null && typeof error === 'object' && 'stack' in error) {
      console.line(...`${error.stack}`.split('\n'))
    }
    return false
  }
}

export async function getSqliteHealth(): Promise<boolean> {
  try {
    await AppDataSource.query('SELECT 1')
    return true
  } catch (error) {
    console.error('SQLite health check failed:', error)
    return false
  }
}
