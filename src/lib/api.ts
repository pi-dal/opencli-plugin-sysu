export const SYSU_DOMAIN = 'jwxt.sysu.edu.cn' as const

export const SYSU_NAVIGATE_URLS = {
  classrooms:
    'https://jwxt.sysu.edu.cn/jwxt/mk/schedule-web/#/classroomCheckStu?code=jwxsd_jsskqkjkxjscx&resourceName=%E6%95%99%E5%AE%A4%E4%B8%8A%E8%AF%BE%E6%83%85%E5%86%B5%E5%8F%8A%E7%A9%BA%E9%97%B2%E6%95%99%E5%AE%A4%E6%9F%A5%E8%AF%A2',
  courses:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/openingCoursesStu?code=jwxsd_qxkckk&resourceName=%E5%85%A8%E6%A0%A1%E5%BC%80%E8%AF%BE%E8%AF%BE%E7%A8%8B',
  timetable:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/studentCourseTable?code=jwxsd_xskb&resourceName=%E6%88%91%E7%9A%84%E8%AF%BE%E8%A1%A8',
  grades:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/stuAchievementView?code=jwxsd_cjcx&resourceName=%E6%88%90%E7%BB%A9%E6%9F%A5%E8%AF%A2',
  exams:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/examPresumably?code=jwxsd_ksap&resourceName=%E8%80%83%E8%AF%95%E5%AE%89%E6%8E%92',
  trainingPlan:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/programApply?code=jwxsd_pyfa&resourceName=%E5%9F%B9%E5%85%BB%E6%96%B9%E6%A1%88',
  evaluation:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/evaluationResultCheck?code=jwxsd_pgjg&resourceName=%E8%AF%84%E6%95%99%E7%BB%93%E6%9E%9C'
} as const

export const SYSU_ENDPOINTS = {
  classroomOccupyDetail: '/jwxt/schedule/agg/classroomOccupy/detail',
  classroomScheduleDetail: '/jwxt/schedule/agg/classroomOccupy/scheduleDetailCheck',
  classroomStudyObjects: '/jwxt/schedule/agg/classesStudyObj/list',
  classrooms: '/jwxt/schedule/agg/classroomOccupy/pageCheckList',
  courses: '/jwxt/schedule/agg/schoolOpeningCoursesSchedule/querySchoolOpeningCourses',
  timetable: '/jwxt/timetable-search/classTableInfo/selectStudentClassTable',
  grades: '/jwxt/achievement-manage/score-check/listV2',
  notifications: '/jwxt/system-manage/info-delivery'
} as const

type CoursesRequestArgs = Record<string, unknown>

type ClassroomsRequestArgs = Record<string, unknown>

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  )
}

export function buildCoursesRequest(args: CoursesRequestArgs) {
  const { limit = 10, page = 1, ...param } = args

  return {
    body: {
      pageNo: page,
      pageSize: limit,
      param: stripUndefined(param),
      total: true
    },
    endpoint: SYSU_ENDPOINTS.courses
  }
}

export function buildClassroomsRequest(args: ClassroomsRequestArgs) {
  const {
    building,
    campus,
    classroom,
    dateFrom,
    dateTo,
    limit = 10,
    mode,
    page = 1,
    sectionFrom,
    sectionTo,
    singleDouble,
    weekdays,
    weekFrom,
    weekTo,
    yearTerm,
    ...rest
  } = args

  return {
    body: {
      pageNo: page,
      pageSize: limit,
      param: stripUndefined({
        ...rest,
        campusId: campus,
        classroomID: classroom,
        dateA: dateFrom,
        dateB: dateTo,
        dayWeeks: weekdays,
        sectionA: sectionFrom,
        sectionB: sectionTo,
        singleOrDoubleWeek: singleDouble,
        teachingBuildID: building,
        weekA: weekFrom,
        weekB: weekTo,
        weekOrTime: mode,
        yearTerm
      }),
      total: true
    },
    endpoint: SYSU_ENDPOINTS.classrooms
  }
}

export function buildClassroomOccupyDetailRequest(id: string) {
  return {
    endpoint: SYSU_ENDPOINTS.classroomOccupyDetail,
    params: { id }
  }
}

export function buildClassroomScheduleDetailRequest(params: {
  classroomId: string
  id: string
  occupyPro: string
}) {
  return {
    endpoint: SYSU_ENDPOINTS.classroomScheduleDetail,
    params: {
      classroomID: params.classroomId,
      id: params.id,
      occupyPro: params.occupyPro
    }
  }
}

export function buildJsonPostEvaluateScript(request: {
  body: Record<string, unknown>
  endpoint: string
}) {
  return `
(async () => {
  const body = ${JSON.stringify(request.body)}
  const response = await fetch(${JSON.stringify(request.endpoint)}, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  return response.json()
})()
`.trim()
}

export function buildQueryEvaluateScript(request: {
  endpoint: string
  params: Record<string, string>
}) {
  const search = new URLSearchParams(request.params).toString()
  const url = search ? `${request.endpoint}?${search}` : request.endpoint

  return `
(async () => {
  const response = await fetch(${JSON.stringify(url)}, {
    credentials: 'include'
  })

  return response.json()
})()
`.trim()
}

export function buildClassroomScheduleDetailEvaluateScript(request: {
  endpoint: string
  params: Record<string, string>
}) {
  const search = new URLSearchParams(request.params).toString()
  const scheduleUrl = search ? `${request.endpoint}?${search}` : request.endpoint

  return `
(async () => {
  const scheduleResponse = await fetch(${JSON.stringify(scheduleUrl)}, {
    credentials: 'include'
  })
  const schedulePayload = await scheduleResponse.json()
  const schedule = schedulePayload?.data ?? {}
  const classesId = schedule?.classesID
  let studyObjects = []

  if (classesId) {
    const studyObjectResponse = await fetch(
      ${JSON.stringify(SYSU_ENDPOINTS.classroomStudyObjects)} + '?' + new URLSearchParams({ id: String(classesId) }).toString(),
      {
        credentials: 'include'
      }
    )
    const studyObjectPayload = await studyObjectResponse.json()
    studyObjects = Array.isArray(studyObjectPayload?.data) ? studyObjectPayload.data : []
  }

  return {
    schedule,
    studyObjects
  }
})()
`.trim()
}

/**
 * Build a GET query to a jwxt endpoint with query parameters.
 * jwxt data APIs use GET with query params, not POST.
 */
export function buildJwxtGetScript(endpoint: string, params?: Record<string, string>): string {
  const search = params ? '?' + new URLSearchParams(params).toString() : ''
  return `
(async () => {
  const response = await fetch(${JSON.stringify(endpoint + search)}, {
    credentials: 'include'
  })
  const data = await response.json()
  return data?.data ?? data ?? []
})()
`.trim()
}
