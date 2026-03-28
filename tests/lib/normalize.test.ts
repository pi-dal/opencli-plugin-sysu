import { describe, expect, it } from 'vitest'

import {
  normalizeClassroomOccupyDetail,
  normalizeClassroomRow,
  normalizeCourseRow,
  normalizeScheduleDetail
} from '../../src/lib/normalize'

describe('normalizeCourseRow', () => {
  it('maps a raw course row into the public output shape', () => {
    expect(
      normalizeCourseRow({
        attendTimePlace: '1-2周/星期一/第1-2节/东A101',
        campusName: '东校园',
        courseCategoryName: '公必',
        courseName: '体育',
        credit: 0.5,
        examTypeName: '考查',
        limitNum: 34,
        openDepartmentName: '体育部',
        progress: '进行中',
        schoolSemester: '2025-2',
        selectedNum: 32,
        studyTargetText: '东校园 软件工程学院 2024级',
        teacherName: '宋花香',
        teachingClassNo: '202527382'
      })
    ).toEqual({
      campus: '东校园',
      courseCategory: '公必',
      courseName: '体育',
      credit: 0.5,
      department: '体育部',
      examType: '考查',
      limitCount: 34,
      scheduleText: '1-2周/星期一/第1-2节/东A101',
      selectedCount: 32,
      studyTargets: '东校园 软件工程学院 2024级',
      teacher: '宋花香',
      teachingProgress: '进行中',
      yearTerm: '2025-2',
      classNo: '202527382'
    })
  })
})

describe('normalizeClassroomRow', () => {
  it('builds an occupiedSections summary while preserving the section cells', () => {
    expect(
      normalizeClassroomRow({
        campus: '东校园',
        classroomID: 'CR-101',
        classroomNum: '东A101',
        date: '2026-03-28',
        dayWeek: 6,
        eightSection: null,
        fiveSection: null,
        fourSection: { occupyReason: '实验课' },
        id: 'OCC-1',
        nineSection: null,
        oneSection: null,
        sevenSection: null,
        sixSection: null,
        tableKey: 'row-1',
        teachingBuild: '东A',
        teachingBuildNum: 'EA',
        tenSection: null,
        threeSection: { occupyReason: '实验课' },
        twoSection: null
      })
    ).toMatchObject({
      campus: '东校园',
      classroomId: 'CR-101',
      classroomNum: '东A101',
      date: '2026-03-28',
      dayWeek: 6,
      id: 'OCC-1',
      occupiedSections: '第3-4节: 实验课',
      teachingBuild: '东A',
      teachingBuildNum: 'EA'
    })
  })
})

describe('normalizeClassroomOccupyDetail', () => {
  it('maps occupancy detail fields into a stable output shape', () => {
    expect(
      normalizeClassroomOccupyDetail({
        date: '2026-03-28',
        dayWeek: 6,
        occupyReason: '考试占用',
        section: '3-4',
        week: '4',
        yearTerm: '2025-2'
      })
    ).toEqual({
      date: '2026-03-28',
      dayWeek: 6,
      occupyReason: '考试占用',
      section: '3-4',
      week: '4',
      yearTerm: '2025-2'
    })
  })
})

describe('normalizeScheduleDetail', () => {
  it('returns schedule metadata together with study objects', () => {
    expect(
      normalizeScheduleDetail(
        {
          attendClassOfCampus: '东校园',
          attendTimePlace: '1-2周/星期一/第1-2节/东A101',
          classesName: '体育(1)',
          classesNum: '202527382',
          courseEnName: 'Physical Education',
          courseName: '体育',
          courseNum: 'PE1001',
          credit: 0.5,
          openClassUnitName: '体育部',
          schoolSemester: '2025-2',
          sumHours: 16,
          teacher: '宋花香',
          totalNum: 34,
          weekHours: 2
        },
        [
          {
            campusName: '东校园',
            className: '软件工程一班',
            collegeName: '软件工程学院',
            num: 34
          }
        ]
      )
    ).toEqual({
      schedule: {
        attendClassOfCampus: '东校园',
        attendTimePlace: '1-2周/星期一/第1-2节/东A101',
        classesName: '体育(1)',
        classesNum: '202527382',
        courseEnName: 'Physical Education',
        courseName: '体育',
        courseNum: 'PE1001',
        credit: 0.5,
        openClassUnitName: '体育部',
        schoolSemester: '2025-2',
        sumHours: 16,
        teacher: '宋花香',
        totalNum: 34,
        weekHours: 2
      },
      studyObjects: [
        {
          campusName: '东校园',
          className: '软件工程一班',
          collegeName: '软件工程学院',
          num: 34
        }
      ]
    })
  })
})
