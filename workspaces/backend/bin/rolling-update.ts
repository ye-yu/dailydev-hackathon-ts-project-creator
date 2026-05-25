#!/usr/bin/env node

import pm2 from 'pm2'
import { promisify } from 'node:util'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms))

// Promisify PM2 methods for cleaner async/await code
const pm2Connect = promisify(pm2.connect.bind(pm2))
const pm2List = promisify(pm2.list.bind(pm2))
const pm2Start = promisify(pm2.start.bind(pm2))
const pm2Restart = promisify(pm2.restart.bind(pm2))
const pm2Stop = promisify(pm2.stop.bind(pm2))
const pm2Delete = promisify(pm2.delete.bind(pm2))
const pm2Disconnect = promisify(pm2.disconnect.bind(pm2))

/**
 * Rolling Update Script for PM2
 *
 * This script implements a zero-downtime rolling update strategy:
 * 1. Get all current instances of the app
 * 2. Start a new instance
 * 3. Wait for the new instance to pass health checks
 * 4. Stop the old instance(s)
 */

const APP_NAME = 'ye-yu-backend'
const HEALTH_CHECK_URL = 'http://localhost:3000/health'
const HEALTH_CHECK_TIMEOUT = 30000 // 30 seconds
const HEALTH_CHECK_INTERVAL = 500 // 500ms between checks

async function checkHealth(url: string) {
  try {
    // @ts-expect-error - typescript complains
    const response = await fetch(url, { timeout: 5000 })
    return response.ok
  } catch {
    return false
  }
}

async function waitForHealthCheck(
  timeout = HEALTH_CHECK_TIMEOUT,
  interval = HEALTH_CHECK_INTERVAL,
) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const isHealthy = await checkHealth(HEALTH_CHECK_URL)
    if (isHealthy) {
      console.log('✓ Health check passed')
      return true
    }
    await sleep(interval)
  }

  console.error('✗ Health check timeout')
  return false
}

async function performRollingUpdate() {
  try {
    await pm2Connect()

    const processes = await pm2List()
    const currentInstances = processes.filter((p) => p.name === APP_NAME)

    if (currentInstances.length === 0) {
      console.log(`No running instances of ${APP_NAME} found. Starting new instance...`)
      await pm2Start('./ecosystem.config.cjs')
      console.log(`Started ${APP_NAME}`)
      return
    }

    console.log(`Found ${currentInstances.length} running instance(s) of ${APP_NAME}`)
    console.log('Starting new instance for rolling update...')

    // Save the old instance IDs before restarting
    const oldInstanceIds = currentInstances
      .map((p) => p.pm_id)
      .filter((e) => typeof e === 'number') as number[]

    // Restart the app (PM2 will start a new instance)
    await pm2Restart(APP_NAME)
    console.log('New instance started, waiting for health check...')

    // Wait for the new instance to be healthy
    const isHealthy = await waitForHealthCheck()

    if (isHealthy) {
      console.log('New instance is healthy. Stopping old instance(s)...')

      // Stop and delete the old instances
      await Promise.all(
        oldInstanceIds.map(async (id) => {
          try {
            await pm2Stop(id)
            console.log(`✓ Stopped old instance ${id}`)
            await pm2Delete(id)
          } catch (err) {
            console.error(`Failed to stop/delete instance ${id}:`, err)
          }
        }),
      )

      console.log('✓ Rolling update completed successfully')
    } else {
      console.error('New instance failed health check. Keeping old instance(s) running.')
      throw new Error('Health check failed for new instance')
    }
  } finally {
    await pm2Disconnect()
  }
}

// Run the rolling update
await performRollingUpdate().catch((error) => {
  console.error('Rolling update failed:', error.message)
  process.exit(1)
})

console.log('Rolling update script completed')
process.exit(0)
