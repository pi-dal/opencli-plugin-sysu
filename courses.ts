import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  buildCoursesRequest,
  buildJsonPostEvaluateScript
} from './src/lib/api'
import { normalizeCliKwargs } from './src/lib/kwargs'
import { normalizeCourseRow } from './src/lib/normalize'

function extractCourseRows(response: any): Array<Record<string, unknown>> {
  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.data?.rows)) {
    return response.data.rows
  }

  return []
}

cli({
  site: 'sysu',
  name: 'courses',
  description: 'SYSU course query',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.courses,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'year-term', help: 'Academic year term, e.g. 2025-2' },
    { name: 'end-year-term', help: 'End academic year term for range queries' },
    { name: 'department', help: 'Teaching department name or code' },
    { name: 'course-name', help: 'Course name keyword' },
    { name: 'teacher', help: 'Teacher name keyword' },
    { name: 'campus', help: 'Campus name or id' },
    { name: 'course-category', help: 'Course category name or code' },
    { name: 'class-level', help: 'Class level name or code' },
    { name: 'class-no', help: 'Teaching class number' },
    { name: 'class-name', help: 'Teaching class name' },
    { name: 'teaching-type', help: 'Teaching type name or code' },
    { name: 'course-code', help: 'Course code' },
    { name: 'building', help: 'Teaching building name or id' },
    { name: 'classroom', help: 'Classroom name or id' },
    { name: 'weekday', help: 'Weekday filter' },
    { name: 'week-from', type: 'int', help: 'Start week number' },
    { name: 'week-to', type: 'int', help: 'End week number' },
    { name: 'section-from', type: 'int', help: 'Start section number' },
    { name: 'section-to', type: 'int', help: 'End section number' },
    { name: 'page', type: 'int', default: 1, help: 'Page number' },
    { name: 'limit', type: 'int', default: 10, help: 'Rows per page' },
    { name: 'raw', type: 'bool', default: false, help: 'Return raw API rows' }
  ],
  func: async (page: any, kwargs: any) => {
    const normalizedKwargs = normalizeCliKwargs(kwargs as Record<string, unknown>)
    const { raw, ...requestArgs } = normalizedKwargs
    const request = buildCoursesRequest(requestArgs)
    const response = await page.evaluate(buildJsonPostEvaluateScript(request))
    const rows = extractCourseRows(response)

    if (raw) {
      return rows
    }

    return rows.map((row: Record<string, unknown>) => normalizeCourseRow(row))
  }
})
