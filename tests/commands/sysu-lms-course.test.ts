import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu-lms course', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu lms-course command with cookie strategy', async () => {
    await import('../../sysu-lms-course.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('lms-course')
    expect(config.domain).toBe('lms.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'id', positional: true, required: true })
    ])
  })

  it('returns { name, sections } shape with course name and sections', async () => {
    await import('../../sysu-lms-course.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn()
    }
    // evaluate calls: waitForContent → true, courseName → "CS101", sections → mock
    page.evaluate
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce('CS101')
      .mockResolvedValueOnce([
        {
          name: 'Week 1',
          modules: [
            { type: 'resource', name: 'Notes', url: 'https://lms.sysu.edu.cn/mod/resource/view.php?id=1', modId: 1 }
          ]
        }
      ])

    const result = await config.func(page, { id: '42' })

    expect(result).toEqual({
      name: 'CS101',
      sections: [
        {
          name: 'Week 1',
          modules: [
            { type: 'resource', name: 'Notes', url: 'https://lms.sysu.edu.cn/mod/resource/view.php?id=1', modId: 1 }
          ]
        }
      ]
    })
  })
})
