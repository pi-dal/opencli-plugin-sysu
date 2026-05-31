import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

const COMMAND_MODULES = [
  '../../sysu-jwxt-courses.ts',
  '../../sysu-jwxt-classrooms.ts',
  '../../sysu-jwxt-classroom-occupy-detail.ts',
  '../../sysu-jwxt-classroom-schedule-detail.ts',
  '../../sysu-lms-dashboard.ts',
  '../../sysu-lms-course.ts',
  '../../sysu-lms-resource.ts',
  '../../sysu-lms-activity.ts',
  '../../sysu-library-databases.ts',
  '../../sysu-library-catalog.ts',
  '../../sysu-library-search.ts',
  '../../sysu-library-item.ts'
]

describe('sysu command output defaults', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers every sysu command with plain as the default format', async () => {
    for (const modulePath of COMMAND_MODULES) {
      await import(modulePath)
    }

    expect(cliMock).toHaveBeenCalledTimes(COMMAND_MODULES.length)

    const configs = cliMock.mock.calls.map(([config]) => config)

    expect(configs.map(config => [config.site, config.name, config.defaultFormat])).toEqual([
      ['sysu', 'jwxt-courses', 'plain'],
      ['sysu', 'jwxt-classrooms', 'plain'],
      ['sysu', 'jwxt-classroom-occupy-detail', 'plain'],
      ['sysu', 'jwxt-classroom-schedule-detail', 'plain'],
      ['sysu', 'lms-dashboard', 'plain'],
      ['sysu', 'lms-course', 'plain'],
      ['sysu', 'lms-resource', 'plain'],
      ['sysu', 'lms-activity', 'plain'],
      ['sysu', 'library-databases', 'plain'],
      ['sysu', 'library-catalog', 'plain'],
      ['sysu', 'library-search', 'plain'],
      ['sysu', 'library-item', 'plain']
    ])
  })
})
