import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('detail commands', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers classroom-occupy-detail and returns the raw detail payload by default', async () => {
    await import('../../sysu-jwxt-classroom-occupy-detail.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        data: {
          id: 'OCC-1',
          occupyReason: '考试占用'
        }
      }))
    }

    expect(config.name).toBe('jwxt-classroom-occupy-detail')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.navigateBefore).toContain('/classroomCheckStu')
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'id', positional: true, required: true })
    ])
    await expect(config.func(page, { id: 'OCC-1' })).resolves.toEqual({
      id: 'OCC-1',
      occupyReason: '考试占用'
    })
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(String))
    const occupyDetailCalls = page.evaluate.mock.calls as unknown[][]
    const occupyDetailScript = occupyDetailCalls[0]?.[0]

    expect(occupyDetailScript).toEqual(expect.any(String))
    expect(String(occupyDetailScript)).toContain('/schedule/agg/classroomOccupy/detail')
  })

  it('registers classroom-schedule-detail and returns schedule plus studyObjects', async () => {
    await import('../../sysu-jwxt-classroom-schedule-detail.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        schedule: {
          attendTimePlace: '1-2周/星期一/第1-2节/东A101',
          classesNum: '202527382',
          courseName: '体育'
        },
        studyObjects: [
          {
            gradeName: '2025级',
            majorName: '软件工程'
          }
        ]
      }))
    }

    expect(config.name).toBe('jwxt-classroom-schedule-detail')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.navigateBefore).toContain('/classroomCheckStu')
    expect(config.args).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'id', positional: true, required: true }),
        expect.objectContaining({ name: 'occupy-pro', required: true }),
        expect.objectContaining({ name: 'classroom-id', required: true })
      ])
    )
    await expect(
      config.func(page, {
        classroomId: 'CR-101',
        id: 'SCH-1',
        occupyPro: '4'
      })
    ).resolves.toEqual({
      schedule: {
        attendTimePlace: '1-2周/星期一/第1-2节/东A101',
        classesNum: '202527382',
        courseName: '体育'
      },
      studyObjects: [
        {
          gradeName: '2025级',
          majorName: '软件工程'
        }
      ]
    })
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(String))
    const scheduleDetailCalls = page.evaluate.mock.calls as unknown[][]
    const scheduleDetailScript = scheduleDetailCalls[0]?.[0]

    expect(scheduleDetailScript).toEqual(expect.any(String))
    expect(String(scheduleDetailScript)).toContain('/schedule/agg/classroomOccupy/scheduleDetailCheck')
    expect(String(scheduleDetailScript)).toContain('/schedule/agg/classesStudyObj/list')
  })

  it('accepts kebab-case detail args from the real CLI parser', async () => {
    await import('../../sysu-jwxt-classroom-schedule-detail.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        schedule: {},
        studyObjects: []
      }))
    }

    await config.func(page, {
      'classroom-id': 'CR-101',
      id: 'SCH-1',
      'occupy-pro': '4'
    })

    const evaluateCalls = page.evaluate.mock.calls as unknown[][]
    const evaluateScript = String(evaluateCalls[0]?.[0] ?? '')

    expect(evaluateScript).toContain('classroomID=CR-101')
    expect(evaluateScript).toContain('occupyPro=4')
    expect(evaluateScript).toContain('id=SCH-1')
  })
})
