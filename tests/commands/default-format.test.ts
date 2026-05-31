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
  '../../sysu-library-item.ts',
  '../../sysu-jwxt-timetable.ts',
  '../../sysu-jwxt-grades.ts',
  '../../sysu-jwxt-notifications.ts'
]

describe('sysu command output defaults', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers every sysu command without overriding default format (CLI default is table)', async () => {
    for (const modulePath of COMMAND_MODULES) {
      await import(modulePath)
    }

    expect(cliMock).toHaveBeenCalledTimes(COMMAND_MODULES.length)

    const configs = cliMock.mock.calls.map(([config]) => config)

    expect(configs.map(config => [config.site, config.name, config.defaultFormat])).toEqual([
      ['sysu', 'jwxt-courses', undefined],
      ['sysu', 'jwxt-classrooms', undefined],
      ['sysu', 'jwxt-classroom-occupy-detail', undefined],
      ['sysu', 'jwxt-classroom-schedule-detail', undefined],
      ['sysu', 'lms-dashboard', undefined],
      ['sysu', 'lms-course', undefined],
      ['sysu', 'lms-resource', undefined],
      ['sysu', 'lms-activity', undefined],
      ['sysu', 'library-databases', undefined],
      ['sysu', 'library-catalog', undefined],
      ['sysu', 'library-search', undefined],
      ['sysu', 'library-item', undefined],
      ['sysu', 'jwxt-timetable', undefined],
      ['sysu', 'jwxt-grades', undefined],
      ['sysu', 'jwxt-notifications', undefined]
    ])
  })
})
