export const SYSU_DOMAIN = 'jwxt.sysu.edu.cn' as const

export const SYSU_NAVIGATE_URLS = {
  classrooms:
    'https://jwxt.sysu.edu.cn/jwxt/mk/schedule-web/#/classroomCheckStu?code=jwxsd_jsskqkjkxjscx&resourceName=%25E6%2595%2599%25E5%25AE%25A4%25E4%25B8%258A%25E8%25AF%25BE%25E6%2583%2585%25E5%2586%25B5%25E5%258F%258A%25E7%25A9%25BA%25E9%2597%25B2%25E6%2595%2599%25E5%25AE%25A4%25E6%259F%25A5%25E8%25AF%25A2',
  courses:
    'https://jwxt.sysu.edu.cn/jwxt/mk/#/openingCoursesStu?code=jwxsd_qxkckk&resourceName=%25E5%2585%25A8%25E6%25A0%25A1%25E5%25BC%2580%25E8%25AF%25BE%25E8%25AF%25BE%25E7%25A8%258B'
} as const

export const SYSU_ENDPOINTS = {
  classroomOccupyDetail: '/jwxt/schedule/agg/classroomOccupy/detail',
  classroomScheduleDetail: '/jwxt/schedule/agg/classroomOccupy/scheduleDetailCheck',
  classroomStudyObjects: '/jwxt/schedule/agg/classesStudyObj/list',
  classrooms: '/jwxt/schedule/agg/classroomOccupy/pageCheckList',
  courses: '/jwxt/schedule/agg/schoolOpeningCoursesSchedule/querySchoolOpeningCourses'
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
