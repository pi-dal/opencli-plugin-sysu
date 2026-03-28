const SECTION_NAMES = [
  'oneSection',
  'twoSection',
  'threeSection',
  'fourSection',
  'fiveSection',
  'sixSection',
  'sevenSection',
  'eightSection',
  'nineSection',
  'tenSection',
  'elevenSection',
  'twelveSection',
  'thirteenSection',
  'fourteenSection',
  'fifteenSection',
  'sixteenSection'
] as const

interface RawCourseRow {
  attendTimePlace?: string
  campusName?: string
  courseCategoryName?: string
  courseName?: string
  credit?: number
  examTypeName?: string
  limitNum?: number
  openDepartmentName?: string
  progress?: string
  schoolSemester?: string
  selectedNum?: number
  studyTargetText?: string
  teacherName?: string
  teachingClassNo?: string
}

interface RawClassroomSection {
  occupyReason?: string
}

interface RawClassroomRow {
  campus?: string
  classroomID?: string
  classroomNum?: string
  date?: string
  dayWeek?: number
  id?: string
  teachingBuild?: string
  teachingBuildNum?: string
  [key: string]: unknown
}

export function normalizeCourseRow(row: RawCourseRow) {
  return {
    campus: row.campusName ?? '',
    classNo: row.teachingClassNo ?? '',
    courseCategory: row.courseCategoryName ?? '',
    courseName: row.courseName ?? '',
    credit: row.credit ?? 0,
    department: row.openDepartmentName ?? '',
    examType: row.examTypeName ?? '',
    limitCount: row.limitNum ?? 0,
    scheduleText: row.attendTimePlace ?? '',
    selectedCount: row.selectedNum ?? 0,
    studyTargets: row.studyTargetText ?? '',
    teacher: row.teacherName ?? '',
    teachingProgress: row.progress ?? '',
    yearTerm: row.schoolSemester ?? ''
  }
}

function buildOccupiedSections(row: RawClassroomRow): string {
  const occupied: Array<{ index: number; reason: string }> = []

  for (const [index, key] of SECTION_NAMES.entries()) {
    const section = row[key] as RawClassroomSection | null | undefined

    if (section?.occupyReason) {
      occupied.push({
        index: index + 1,
        reason: section.occupyReason
      })
    }
  }

  if (occupied.length === 0) {
    return ''
  }

  const start = occupied[0].index
  let end = occupied[0].index

  for (let index = 1; index < occupied.length; index += 1) {
    if (occupied[index].reason === occupied[0].reason && occupied[index].index === end + 1) {
      end = occupied[index].index
    }
  }

  const label = start === end ? `第${start}节` : `第${start}-${end}节`
  return `${label}: ${occupied[0].reason}`
}

export function normalizeClassroomRow(row: RawClassroomRow) {
  return {
    ...row,
    classroomId: row.classroomID ?? '',
    occupiedSections: buildOccupiedSections(row)
  }
}

export function normalizeClassroomOccupyDetail<T>(row: T): T {
  return row
}

export function normalizeScheduleDetail<T, U>(schedule: T, studyObjects: U): { schedule: T; studyObjects: U } {
  return {
    schedule,
    studyObjects
  }
}
