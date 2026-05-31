import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  buildClassroomsRequest,
  buildJsonPostEvaluateScript
} from './src/lib/api'
import { resolveClassroomLookupArgs } from './src/lib/classroom-lookup'
import { normalizeCliKwargs } from './src/lib/kwargs'
import { normalizeClassroomRow } from './src/lib/normalize'
import { validateClassroomsArgs } from './src/lib/validate'

function extractClassroomRows(response: any): Array<Record<string, unknown>> {
  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data
  }

  return []
}

cli({
  site: 'sysu',
  name: 'jwxt-classrooms',
  description: 'SYSU classroom occupancy query',
  defaultFormat: 'plain',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.classrooms,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'campus', help: 'Campus name or id' },
    { name: 'building', help: 'Teaching building name or id' },
    { name: 'classroom', help: 'Classroom name or id' },
    { name: 'mode', choices: ['time', 'week'], default: 'time', help: 'Query by time range or teaching week' },
    { name: 'date-from', help: 'Start date in YYYY-MM-DD' },
    { name: 'date-to', help: 'End date in YYYY-MM-DD' },
    { name: 'year-term', help: 'Academic year term, e.g. 2025-2' },
    { name: 'week-from', type: 'int', help: 'Start week number' },
    { name: 'week-to', type: 'int', help: 'End week number' },
    { name: 'weekdays', help: 'Comma-separated weekdays, e.g. 一,三,五' },
    { name: 'single-double', type: 'int', help: '0 every week, 1 odd weeks, 2 even weeks' },
    { name: 'section-from', type: 'int', help: 'Start section number' },
    { name: 'section-to', type: 'int', help: 'End section number' },
    { name: 'page', type: 'int', default: 1, help: 'Page number' },
    { name: 'limit', type: 'int', default: 10, help: 'Rows per page' },
    { name: 'raw', type: 'bool', default: false, help: 'Return raw API rows' }
  ],
  func: async (page: any, kwargs: any) => {
    const normalizedKwargs = normalizeCliKwargs(kwargs as Record<string, unknown>)
    const { raw, ...validationArgs } = normalizedKwargs
    const lookedUpArgs = await resolveClassroomLookupArgs(page, validationArgs)
    const validArgs = validateClassroomsArgs(lookedUpArgs as any)
    const request = buildClassroomsRequest(validArgs as unknown as Record<string, unknown>)
    const response = await page.evaluate(buildJsonPostEvaluateScript(request))
    const rows = extractClassroomRows(response)

    if (raw) {
      return rows
    }

    return rows.map((row: Record<string, unknown>) => normalizeClassroomRow(row))
  }
})
