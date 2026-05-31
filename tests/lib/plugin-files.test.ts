import { describe, expect, it } from 'vitest'

import {
  getPluginCommandBuildEntries,
  getPluginCommandSourceFiles
} from '../../src/lib/plugin-files'

describe('plugin runtime file selection', () => {
  it('treats the seven command adapters as plugin runtime sources', () => {
    expect(getPluginCommandSourceFiles()).toEqual([
      'sysu-jwxt-courses.ts',
      'sysu-jwxt-classrooms.ts',
      'sysu-jwxt-classroom-occupy-detail.ts',
      'sysu-jwxt-classroom-schedule-detail.ts',
      'sysu-lms-dashboard.ts',
      'sysu-lms-course.ts',
      'sysu-lms-resource.ts'
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
        input: 'sysu-jwxt-classroom-occupy-detail.ts',
        output: 'sysu-jwxt-classroom-occupy-detail.js'
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
      }
    ])
  })
})
