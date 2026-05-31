import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu lms-activity', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu lms-activity command with cookie strategy', async () => {
    await import('../../sysu-lms-activity.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('lms-activity')
    expect(config.domain).toBe('lms.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'url', positional: true, required: true })
    ])
  })

  it('returns generic activity detail without assignment/quiz-specific fields', async () => {
    await import('../../sysu-lms-activity.ts')

    const config = cliMock.mock.calls[0][0]
    const mockActivity = {
      name: 'Week 1 Assignment',
      type: 'assignment',
      modId: 42,
      url: 'https://lms.sysu.edu.cn/mod/assign/view.php?id=42',
      description: 'Submit your report'
    }
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn(async () => mockActivity)
    }

    const result = await config.func(page, { url: 'https://lms.sysu.edu.cn/mod/assign/view.php?id=42' })

    expect(page.goto).toHaveBeenCalled()
    expect(result.name).toBe('Week 1 Assignment')
    expect(result.type).toBe('assignment')
    // no submission/quiz/grade-specific fields
    expect(result.submission).toBeUndefined()
    expect(result.quiz).toBeUndefined()
  })
})
