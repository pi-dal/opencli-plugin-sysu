import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  SYSU_ENDPOINTS,
  buildJwxtGetScript
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-grades',
  description: 'SYSU exam scores — query student grades by semester',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.grades,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'semester', help: 'Semester code, e.g. 2025-2' }
  ],
  func: async (page: any, kwargs: any) => {
    const params: Record<string, string> = {}
    if (kwargs.semester) params.semester = String(kwargs.semester)
    const script = buildJwxtGetScript(SYSU_ENDPOINTS.grades, params)
    const data = await page.evaluate(script)
    return Array.isArray(data) ? data : (data?.rows ?? data?.data ?? [])
  }
})
