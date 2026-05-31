import { describe, expect, it } from 'vitest'

import {
  SYSU_ENDPOINTS,
  buildClassroomScheduleDetailRequest,
  buildClassroomsRequest,
  buildCoursesRequest
} from '../../src/lib/api'

describe('buildCoursesRequest', () => {
  it('creates a paged request envelope for course queries', () => {
    expect(
      buildCoursesRequest({
        campus: 'EAST',
        courseName: '体育',
        limit: 20,
        page: 2,
        yearTerm: '2025-2'
      })
    ).toEqual({
      body: {
        pageNo: 2,
        pageSize: 20,
        param: {
          campus: 'EAST',
          courseName: '体育',
          yearTerm: '2025-2'
        },
        total: true
      },
      endpoint: SYSU_ENDPOINTS.courses
    })
  })
})

describe('buildClassroomsRequest', () => {
  it('creates the required pageCheckList request envelope', () => {
    expect(
      buildClassroomsRequest({
        building: 'EA',
        campus: 'EAST',
        classroom: 'CR-101',
        dateFrom: '2026-03-28',
        dateTo: '2026-03-29',
        limit: 5,
        mode: 'time',
        page: 1,
        sectionFrom: 1,
        sectionTo: 2,
        singleDouble: 1,
        weekFrom: 3,
        weekTo: 4,
        weekdays: ['一', '三'],
        yearTerm: '2025-2'
      })
    ).toEqual({
      body: {
        pageNo: 1,
        pageSize: 5,
        param: {
          campusId: 'EAST',
          classroomID: 'CR-101',
          dateA: '2026-03-28',
          dateB: '2026-03-29',
          dayWeeks: ['一', '三'],
          sectionA: 1,
          sectionB: 2,
          singleOrDoubleWeek: 1,
          teachingBuildID: 'EA',
          weekA: 3,
          weekB: 4,
          weekOrTime: 'time',
          yearTerm: '2025-2'
        },
        total: true
      },
      endpoint: SYSU_ENDPOINTS.classrooms
    })
  })
})

describe('detail request builders', () => {
  it('creates the schedule detail request', () => {
    expect(
      buildClassroomScheduleDetailRequest({
        classroomId: 'CR-101',
        id: 'SCH-1',
        occupyPro: '4'
      })
    ).toEqual({
      endpoint: SYSU_ENDPOINTS.classroomScheduleDetail,
      params: {
        classroomID: 'CR-101',
        id: 'SCH-1',
        occupyPro: '4'
      }
    })
  })
})
