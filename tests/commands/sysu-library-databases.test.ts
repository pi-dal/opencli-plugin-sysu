import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu library-databases', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu library-databases command with cookie strategy', async () => {
    await import('../../sysu-library-databases.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('library-databases')
    expect(config.domain).toBe('library.sysu.edu.cn')
    expect(config.navigateBefore).toContain('/page/3640')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
  })

  it('returns databases with name, url after extraction', async () => {
    await import('../../sysu-library-databases.ts')

    const config = cliMock.mock.calls[0][0]
    const mockDatabases = [
      { name: 'Web of Science', url: 'https://library.sysu.edu.cn/page/3640?title=web+of+science', description: 'Citation database' },
      { name: 'CNKI', url: 'https://library.sysu.edu.cn/page/3640?title=cnki', description: 'Chinese academic journals' }
    ]
    const page = {
      evaluate: vi.fn(async () => mockDatabases)
    }

    const result = await config.func(page, {})

    expect(page.evaluate).toHaveBeenCalled()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Web of Science')
  })

  it('filters databases by keyword', async () => {
    await import('../../sysu-library-databases.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => [
        { name: 'Web of Science', url: 'https://library.sysu.edu.cn/page/3640?title=web+of+science' },
        { name: 'PubMed', url: 'https://library.sysu.edu.cn/page/3640?title=pubmed' },
        { name: 'CNKI', url: 'https://library.sysu.edu.cn/page/3640?title=cnki' }
      ])
    }

    const result = await config.func(page, { keyword: 'pubmed' })

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('PubMed')
  })
})
