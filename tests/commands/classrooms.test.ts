import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('classrooms command', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu classrooms command with cookie strategy', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('jwxt-classrooms')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.navigateBefore).toContain('/classroomCheckStu')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'building' }),
        expect.objectContaining({ name: 'classroom' }),
        expect.objectContaining({ name: 'mode', choices: ['time', 'week'], default: 'time' }),
        expect.objectContaining({ name: 'date-from' }),
        expect.objectContaining({ name: 'year-term' }),
        expect.objectContaining({ name: 'week-from', type: 'int' }),
        expect.objectContaining({ name: 'single-double', type: 'int' }),
        expect.objectContaining({ name: 'page', type: 'int', default: 1 }),
        expect.objectContaining({ name: 'raw', type: 'bool', default: false })
      ])
    )
  })

  it('returns normalized classroom rows by default', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        data: [
          {
            campus: '东校园',
            classroomID: 'CR-101',
            classroomNum: '东A101',
            date: '2026-03-28',
            dayWeek: 6,
            fourSection: { occupyReason: '实验课' },
            id: 'OCC-1',
            teachingBuild: '东A',
            teachingBuildNum: 'EA',
            threeSection: { occupyReason: '实验课' }
          }
        ]
      }))
    }

    await expect(
      config.func(page, {
        building: 'EA',
        dateFrom: '2026-03-28',
        dateTo: '2026-03-29',
        mode: 'time'
      })
    ).resolves.toMatchObject([
      {
        classroomId: 'CR-101',
        occupiedSections: '第3-4节: 实验课'
      }
    ])

    expect(page.evaluate).toHaveBeenCalledTimes(1)
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(String))
    const evaluateCalls = page.evaluate.mock.calls as unknown[][]
    const evaluateScript = evaluateCalls[0]?.[0]

    expect(evaluateScript).toEqual(expect.any(String))
    expect(String(evaluateScript)).toContain('/jwxt/schedule/agg/classroomOccupy/pageCheckList')
    expect(String(evaluateScript)).toContain('"weekOrTime":"time"')
    expect(String(evaluateScript)).toContain('"teachingBuildID":"EA"')
  })

  it('validates classroom args before making the browser request', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn()
    }

    await expect(
      config.func(page, {
        dateFrom: '2026-03-28',
        dateTo: '2026-03-29',
        mode: 'time'
      })
    ).rejects.toThrowError('building or classroom is required')

    expect(page.evaluate).not.toHaveBeenCalled()
  })

  it('reads rows from the real classroom payload shape', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        code: 200,
        data: {
          data: [
            {
              classroomID: 'CR-201',
              classroomNum: '东B201',
              id: 'OCC-2',
              teachingBuild: '东B'
            }
          ],
          dateList: ['2026-03-28']
        }
      }))
    }

    await expect(
      config.func(page, {
        building: 'EA',
        dateFrom: '2026-03-28',
        dateTo: '2026-03-29',
        mode: 'time'
      })
    ).resolves.toEqual([
      expect.objectContaining({
        classroomId: 'CR-201',
        classroomNum: '东B201',
        id: 'OCC-2'
      })
    ])
  })

  it('accepts kebab-case classroom args and normalizes weekdays', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        data: {
          data: []
        }
      }))
    }

    await config.func(page, {
      building: 'EA',
      'date-from': '2026-03-28',
      'date-to': '2026-03-29',
      mode: 'week',
      'single-double': 1,
      weekdays: '一,三,五',
      'week-from': 3,
      'week-to': 4,
      'year-term': '2025-2'
    })

    const evaluateCalls = page.evaluate.mock.calls as unknown[][]
    const evaluateScript = String(evaluateCalls[0]?.[0] ?? '')

    expect(evaluateScript).toContain('"dateA":"2026-03-28"')
    expect(evaluateScript).toContain('"dateB":"2026-03-29"')
    expect(evaluateScript).toContain('"weekA":3')
    expect(evaluateScript).toContain('"weekB":4')
    expect(evaluateScript).toContain('"singleOrDoubleWeek":1')
    expect(evaluateScript).toContain('"dayWeeks":["一","三","五"]')
    expect(evaluateScript).toContain('"yearTerm":"2025-2"')
  })

  it('resolves campus, building, and classroom display values before querying classrooms', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi
        .fn()
        .mockResolvedValueOnce({
          data: [{ campusName: '东校园', id: 'CAMPUS-1' }]
        })
        .mockResolvedValueOnce({
          data: [{ id: 'BUILD-1', name: '东A' }]
        })
        .mockResolvedValueOnce({
          data: [{ code: '东A101', id: 'ROOM-1' }]
        })
        .mockResolvedValueOnce({
          data: {
            data: []
          }
        })
    }

    await config.func(page, {
      building: '东A',
      campus: '东校园',
      classroom: '东A101',
      'date-from': '2026-03-28',
      'date-to': '2026-03-29',
      mode: 'time'
    })

    expect(page.evaluate).toHaveBeenCalledTimes(4)

    const evaluateCalls = page.evaluate.mock.calls as unknown[][]
    const campusLookupScript = String(evaluateCalls[0]?.[0] ?? '')
    const buildingLookupScript = String(evaluateCalls[1]?.[0] ?? '')
    const classroomLookupScript = String(evaluateCalls[2]?.[0] ?? '')
    const queryScript = String(evaluateCalls[3]?.[0] ?? '')

    expect(campusLookupScript).toContain('/base-info/campus/findCampusNamesBox')
    expect(buildingLookupScript).toContain('/base-info/teaching-building/pull?campusId=CAMPUS-1')
    expect(classroomLookupScript).toContain('/base-info/classroom/queryclassroombymulticonditionV2')
    expect(classroomLookupScript).toContain('"campusId":"CAMPUS-1"')
    expect(classroomLookupScript).toContain('"teachingBuildIDs":"BUILD-1"')
    expect(classroomLookupScript).toContain('"classroomCode":"东A101"')
    expect(queryScript).toContain('"campusId":"CAMPUS-1"')
    expect(queryScript).toContain('"teachingBuildID":"BUILD-1"')
    expect(queryScript).toContain('"classroomID":"ROOM-1"')
  })

  it('surfaces fetched building candidates when building lookup fails', async () => {
    await import('../../sysu-jwxt-classrooms.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi
        .fn()
        .mockResolvedValueOnce({
          data: [{ campusName: '东校园', id: 'CAMPUS-1' }]
        })
        .mockResolvedValueOnce({
          data: [
            { id: 'BUILD-1', name: '东A' },
            { id: 'BUILD-2', name: '东B' }
          ]
        })
    }

    await expect(
      config.func(page, {
        building: '不存在教学楼',
        campus: '东校园',
        'date-from': '2026-03-28',
        'date-to': '2026-03-29',
        mode: 'time'
      })
    ).rejects.toThrowError('unknown building: 不存在教学楼. candidates: 东A, 东B')
  })
})
