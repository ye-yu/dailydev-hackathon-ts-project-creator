import { router } from '../router.ts'
import { getHealth } from './health.controller.ts'

router.get('/health', getHealth)
