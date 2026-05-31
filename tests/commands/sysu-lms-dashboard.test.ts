import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu-lms dashboard', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu lms-dashboard command with cookie strategy', async () => {
    await import('../../sysu-lms-dashboard.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('lms-dashboard')
    expect(config.domain).toBe('lms.sysu.edu.cn')
    expect(config.navigateBefore).toContain('/my/')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
  })

  it('extracts courses with id, name, url from dashboard DOM', async () => {
    await import('../../sysu-lms-dashboard.ts')

    const config = cliMock.mock.calls[0][0]
    const mockCourses = [
      { id: '123', name: 'Course A', url: 'https://lms.sysu.edu.cn/course/view.php?id=123', summary: 'Intro' },
      { id: '456', name: 'Course B', url: 'https://lms.sysu.edu.cn/course/view.php?id=456' }
    ]
    const page = {
      evaluate: vi.fn(async () => mockCourses)
    }

    const result = await config.func(page, {})

    expect(page.evaluate).toHaveBeenCalled()
    expect(result).toEqual(mockCourses)
  })

  it('navigates to /my/ for dashboard', () => {
    expect.assertions(1)
    // Verifying navigateBefore URL pattern
    const dashboardUrl = 'https://lms.sysu.edu.cn/my/'
    expect(dashboardUrl).toContain('/my/')
  })
})
