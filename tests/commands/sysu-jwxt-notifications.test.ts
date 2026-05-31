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

  it('registers the sysu jwxt-notifications command with cookie strategy', async () => {
    await import('../../sysu-jwxt-notifications.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('jwxt-notifications')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
  })

  it('returns notification data from the API', async () => {
    await import('../../sysu-jwxt-notifications.ts')

    const config = cliMock.mock.calls[0][0]
    const notifData = {
      college: [{ title: '2026年毕业论文通知', publishTime: '2026-05-01' }]
    }
    const page = {
      evaluate: vi.fn(async () => notifData)
    }

    const result = await config.func(page, {})

    expect(page.evaluate).toHaveBeenCalled()
    expect(result).toEqual(notifData)
  })
})
