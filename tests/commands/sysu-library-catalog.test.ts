import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu library-catalog', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu library-catalog command with cookie strategy', async () => {
    await import('../../sysu-library-catalog.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('library-catalog')
    expect(config.domain).toBe('library.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'query', positional: true, required: true }),
      expect.objectContaining({ name: 'type' })
    ])
  })

  it('returns catalog records from INNOPAC search', async () => {
    await import('../../sysu-library-catalog.ts')

    const config = cliMock.mock.calls[0][0]
    const mockResults = [
      { title: 'Machine Learning', author: 'Tom Mitchell', callNumber: 'TP181', status: 'Available', url: 'http://10.8.11.130:8991/F/-?func=full-set' }
    ]
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn(async () => mockResults)
    }

    const result = await config.func(page, { query: 'machine learning', type: 'title' })

    expect(page.goto).toHaveBeenCalledWith(expect.stringContaining('find_code=WRD'))
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Machine Learning')
  })
})
