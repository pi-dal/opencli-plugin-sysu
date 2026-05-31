import { describe, expect, it } from 'vitest'

import {
  getPluginCommandBuildEntries,
  getPluginCommandSourceFiles
} from '../../src/lib/plugin-files'

describe('plugin runtime file selection', () => {
  it('treats all command adapters as plugin runtime sources', () => {
    expect(getPluginCommandSourceFiles()).toEqual([
      'sysu-jwxt-courses.ts',
      'sysu-jwxt-classrooms.ts',
      'sysu-jwxt-classroom-schedule-detail.ts',
      'sysu-lms-dashboard.ts',
      'sysu-lms-course.ts',
      'sysu-lms-resource.ts',
      'sysu-library-databases.ts',
      'sysu-library-catalog.ts',
      'sysu-library-item.ts',
      'sysu-lms-activity.ts',
      'sysu-jwxt-timetable.ts',
      'sysu-jwxt-grades.ts',
      'sysu-jwxt-notifications.ts'
    ])
  })

  it('maps runtime source files to root-level js outputs', () => {
    expect(getPluginCommandBuildEntries()).toEqual([
      {
        input: 'sysu-jwxt-courses.ts',
        output: 'sysu-jwxt-courses.js'
      },
      {
        input: 'sysu-jwxt-classrooms.ts',
        output: 'sysu-jwxt-classrooms.js'
      },
      {
        input: 'sysu-jwxt-classroom-schedule-detail.ts',
        output: 'sysu-jwxt-classroom-schedule-detail.js'
      },
      {
        input: 'sysu-lms-dashboard.ts',
        output: 'sysu-lms-dashboard.js'
      },
      {
        input: 'sysu-lms-course.ts',
        output: 'sysu-lms-course.js'
      },
      {
        input: 'sysu-lms-resource.ts',
        output: 'sysu-lms-resource.js'
      },
      {
        input: 'sysu-library-databases.ts',
        output: 'sysu-library-databases.js'
      },
      {
        input: 'sysu-library-catalog.ts',
        output: 'sysu-library-catalog.js'
      },
      {
        input: 'sysu-library-item.ts',
        output: 'sysu-library-item.js'
      },
      {
        input: 'sysu-lms-activity.ts',
        output: 'sysu-lms-activity.js'
      },
      {
        input: 'sysu-jwxt-timetable.ts',
        output: 'sysu-jwxt-timetable.js'
      },
      {
        input: 'sysu-jwxt-grades.ts',
        output: 'sysu-jwxt-grades.js'
      },
      {
        input: 'sysu-jwxt-notifications.ts',
        output: 'sysu-jwxt-notifications.js'
      }
    ])
  })
})
