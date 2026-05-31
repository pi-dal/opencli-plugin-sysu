import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu library-search', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu library-search command with cookie strategy', async () => {
    await import('../../sysu-library-search.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('library-search')
    expect(config.domain).toBe('library.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'query', positional: true, required: true })
    ])
  })

  it('returns search results with optional fields', async () => {
    await import('../../sysu-library-search.ts')

    const config = cliMock.mock.calls[0][0]
    const mockResults = [
      { title: 'Machine Learning', url: 'https://example.com/1', snippet: 'A book about ML', author: 'T. Mitchell' }
    ]
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn(async () => mockResults)
    }

    const result = await config.func(page, { query: 'machine learning' })

    expect(page.goto).toHaveBeenCalled()
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Machine Learning')
  })
})
