import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('courses command', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu courses command with cookie strategy', async () => {
    await import('../../courses.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('courses')
    expect(config.description).toContain('course')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.navigateBefore).toContain('/openingCoursesStu')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'course-name' }),
        expect.objectContaining({ name: 'year-term' }),
        expect.objectContaining({ name: 'week-from', type: 'int' }),
        expect.objectContaining({ name: 'section-to', type: 'int' }),
        expect.objectContaining({ name: 'page', type: 'int', default: 1 }),
        expect.objectContaining({ name: 'limit', type: 'int', default: 10 }),
        expect.objectContaining({ name: 'raw', type: 'bool', default: false })
      ])
    )
  })

  it('returns normalized rows by default', async () => {
    await import('../../courses.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        data: [
          {
            campusName: '东校园',
            courseName: '体育',
            openDepartmentName: '体育部',
            schoolSemester: '2025-2',
            teachingClassNo: '202527382'
          }
        ]
      }))
    }

    await expect(config.func(page, { courseName: '体育', limit: 5, page: 1 })).resolves.toEqual([
      {
        campus: '东校园',
        classNo: '202527382',
        courseCategory: '',
        courseName: '体育',
        credit: 0,
        department: '体育部',
        examType: '',
        limitCount: 0,
        scheduleText: '',
        selectedCount: 0,
        studyTargets: '',
        teacher: '',
        teachingProgress: '',
        yearTerm: '2025-2'
      }
    ])

    expect(page.evaluate).toHaveBeenCalledTimes(1)
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(String))
    const evaluateCalls = page.evaluate.mock.calls as unknown[][]
    const evaluateScript = evaluateCalls[0]?.[0]

    expect(evaluateScript).toEqual(expect.any(String))
    expect(String(evaluateScript)).toContain(
      '/jwxt/schedule/agg/schoolOpeningCoursesSchedule/querySchoolOpeningCourses'
    )
    expect(String(evaluateScript)).toContain('"courseName":"体育"')
  })

  it('returns raw rows when raw mode is requested', async () => {
    await import('../../courses.ts')

    const config = cliMock.mock.calls[0][0]
    const rawRow = {
      campusName: '东校园',
      courseName: '体育'
    }
    const page = {
      evaluate: vi.fn(async () => ({
        data: [rawRow]
      }))
    }

    await expect(config.func(page, { courseName: '体育', raw: true })).resolves.toEqual([rawRow])
  })

  it('reads rows from the real payload shape', async () => {
    await import('../../courses.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        code: 200,
        data: {
          rows: [
            {
              courseName: '高等数学',
              openDepartmentName: '数学学院',
              schoolSemester: '2025-2'
            }
          ],
          total: 1
        }
      }))
    }

    await expect(config.func(page, {})).resolves.toEqual([
      expect.objectContaining({
        courseName: '高等数学',
        department: '数学学院',
        yearTerm: '2025-2'
      })
    ])
  })

  it('accepts kebab-case course args from the real CLI parser', async () => {
    await import('../../courses.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        data: []
      }))
    }

    await config.func(page, {
      'course-name': '体育',
      limit: 5,
      page: 1,
      'year-term': '2025-2'
    })

    const evaluateCalls = page.evaluate.mock.calls as unknown[][]
    const evaluateScript = String(evaluateCalls[0]?.[0] ?? '')

    expect(evaluateScript).toContain('"courseName":"体育"')
    expect(evaluateScript).toContain('"yearTerm":"2025-2"')
  })
})
