import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  SYSU_ENDPOINTS,
  buildJwxtQueryScript
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-enrollment',
  description: 'SYSU course enrollment — query enrolled/selected courses',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.timetable,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'year-term', help: 'Academic year term, e.g. 2025-2' }
  ],
  func: async (page: any, kwargs: any) => {
    const params: Record<string, unknown> = {}
    if (kwargs.yearTerm) params.yearTerm = kwargs.yearTerm
    const script = buildJwxtQueryScript(SYSU_ENDPOINTS.elective, params)
    const data = await page.evaluate(script)
    return Array.isArray(data) ? data : (data?.rows ?? data?.data ?? [])
  }
})
