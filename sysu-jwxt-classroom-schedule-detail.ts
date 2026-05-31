import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  buildClassroomScheduleDetailEvaluateScript,
  buildClassroomScheduleDetailRequest
} from './src/lib/api'
import { normalizeCliKwargs } from './src/lib/kwargs'
import { normalizeScheduleDetail } from './src/lib/normalize'

cli({
  site: 'sysu',
  name: 'jwxt-classroom-schedule-detail',
  description: 'SYSU classroom schedule detail',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.classrooms,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'id', positional: true, required: true, help: 'Schedule detail id' },
    { name: 'occupy-pro', required: true, help: 'Occupancy type code' },
    { name: 'classroom-id', required: true, help: 'Classroom id' }
  ],
  func: async (page: any, kwargs: any) => {
    const normalizedKwargs = normalizeCliKwargs(kwargs as Record<string, unknown>)
    const request = buildClassroomScheduleDetailRequest({
      classroomId: String(normalizedKwargs.classroomId),
      id: String(normalizedKwargs.id),
      occupyPro: String(normalizedKwargs.occupyPro)
    })
    const response = await page.evaluate(buildClassroomScheduleDetailEvaluateScript(request))

    return normalizeScheduleDetail(response?.schedule ?? {}, response?.studyObjects ?? [])
  }
})
