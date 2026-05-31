import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu jwxt-notifications', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu jwxt-notifications command', async () => {
    await import('../../sysu-jwxt-notifications.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('jwxt-notifications')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
  })

  it('flattens college and education into flat list with category', async () => {
    await import('../../sysu-jwxt-notifications.ts')

    const config = cliMock.mock.calls[0][0]
    const mockData = [
      { id: '1', title: '教务部通知', date: '2026-05-01', category: 'education' },
      { id: '2', title: '学院通知', date: '2026-05-02', category: 'college' }
    ]
    const page = {
      evaluate: vi.fn(async () => mockData)
    }

    const result = await config.func(page, {})

    expect(result).toHaveLength(2)
    expect(result[0].category).toBe('education')
    expect(result[1].category).toBe('college')
  })

  it('filters by category', async () => {
    await import('../../sysu-jwxt-notifications.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => [
        { id: '1', title: 'A', category: 'education' },
        { id: '2', title: 'B', category: 'college' }
      ])
    }

    const result = await config.func(page, { category: 'college' })

    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('college')
  })

  it('filters by keyword in title', async () => {
    await import('../../sysu-jwxt-notifications.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => [
        { id: '1', title: '图像采集通知', category: 'education' },
        { id: '2', title: '学位授予通知', category: 'college' }
      ])
    }

    const result = await config.func(page, { keyword: '学位' })

    expect(result).toHaveLength(1)
    expect(result[0].title).toContain('学位')
  })
})
