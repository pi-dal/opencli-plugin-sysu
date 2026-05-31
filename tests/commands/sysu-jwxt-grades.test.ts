import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu jwxt-grades', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu jwxt-grades command with cookie strategy', async () => {
    await import('../../sysu-jwxt-grades.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('jwxt-grades')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'semester' })
    ])
  })

  it('returns grades data from the API', async () => {
    await import('../../sysu-jwxt-grades.ts')

    const config = cliMock.mock.calls[0][0]
    const gradesData = [
      { courseName: '概率统计', score: '85', credit: '4' }
    ]
    const page = {
      evaluate: vi.fn(async () => gradesData)
    }

    const result = await config.func(page, { semester: '2025-2' })

    expect(page.evaluate).toHaveBeenCalled()
    expect(result).toEqual(gradesData)
  })
})
