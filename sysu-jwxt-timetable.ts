import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  SYSU_ENDPOINTS,
  buildJwxtGetScript
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-timetable',
  description: 'SYSU course schedule — personal timetable for current semester',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.timetable,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'year-term', help: 'Academic year term, e.g. 2025-2' },
    { name: 'week', type: 'int', help: 'Week number (1-20) for weekly schedule' }
  ],
  func: async (page: any, kwargs: any) => {
    const params: Record<string, string> = {}
    if (kwargs.yearTerm) params.academicYear = String(kwargs.yearTerm)
    if (kwargs.week) params.weekly = String(kwargs.week)
    const script = buildJwxtGetScript(SYSU_ENDPOINTS.timetable, params)
    const data = await page.evaluate(script)
    return Array.isArray(data) ? data : (data?.rows ?? data?.data ?? [])
  }
})
