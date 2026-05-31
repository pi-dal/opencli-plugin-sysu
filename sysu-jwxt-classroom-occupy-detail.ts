import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  buildClassroomOccupyDetailRequest,
  buildQueryEvaluateScript
} from './src/lib/api'
import { normalizeCliKwargs } from './src/lib/kwargs'

cli({
  site: 'sysu',
  name: 'jwxt-classroom-occupy-detail',
  description: 'SYSU classroom occupancy detail',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.classrooms,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [{ name: 'id', positional: true, required: true, help: 'Occupancy record id' }],
  func: async (page: any, kwargs: any) => {
    const normalizedKwargs = normalizeCliKwargs(kwargs as Record<string, unknown>)
    const request = buildClassroomOccupyDetailRequest(String(normalizedKwargs.id))
    const response = await page.evaluate(buildQueryEvaluateScript(request))

    return response?.data ?? null
  }
})
