import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu jwxt-timetable', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu jwxt-timetable command with cookie strategy', async () => {
    await import('../../sysu-jwxt-timetable.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('jwxt-timetable')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'year-term' }),
      expect.objectContaining({ name: 'week', type: 'int' })
    ])
  })

  it('returns timetable data from the API', async () => {
    await import('../../sysu-jwxt-timetable.ts')

    const config = cliMock.mock.calls[0][0]
    const timetableData = [
      { weekday: '星期一', courses: [{ name: '概率统计', teacher: '苏宁' }] }
    ]
    const page = {
      evaluate: vi.fn(async () => timetableData)
    }

    const result = await config.func(page, { yearTerm: '2025-2', week: 13 })

    expect(page.evaluate).toHaveBeenCalled()
    expect(result).toEqual(timetableData)
  })
})
