import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu library-item', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu library-item command with cookie strategy', async () => {
    await import('../../sysu-library-item.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('library-item')
    expect(config.domain).toBe('library.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'catalog-url-or-id', positional: true, required: true })
    ])
  })

  it('returns catalog item detail', async () => {
    await import('../../sysu-library-item.ts')

    const config = cliMock.mock.calls[0][0]
    const mockDetail = {
      title: 'Machine Learning',
      author: 'Tom Mitchell',
      callNumber: 'TP181',
      status: 'Available',
      url: 'http://10.8.11.130:8991/F/-?func=full-set-set&format=999'
    }
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn(async () => mockDetail)
    }

    const result = await config.func(page, { catalogUrlOrId: '12345' })

    expect(page.goto).toHaveBeenCalled()
    expect(result.title).toBe('Machine Learning')
    expect(result.callNumber).toBe('TP181')
  })
})
