import { describe, expect, it } from 'vitest'

import {
  getPluginCommandBuildEntries,
  getPluginCommandSourceFiles
} from '../../src/lib/plugin-files'

describe('plugin runtime file selection', () => {
  it('only treats the four command adapters as plugin runtime sources', () => {
    expect(getPluginCommandSourceFiles()).toEqual([
      'courses.ts',
      'classrooms.ts',
      'classroom-occupy-detail.ts',
      'classroom-schedule-detail.ts'
    ])
  })

  it('maps runtime source files to root-level js outputs', () => {
    expect(getPluginCommandBuildEntries()).toEqual([
      {
        input: 'courses.ts',
        output: 'courses.js'
      },
      {
        input: 'classrooms.ts',
        output: 'classrooms.js'
      },
      {
        input: 'classroom-occupy-detail.ts',
        output: 'classroom-occupy-detail.js'
      },
      {
        input: 'classroom-schedule-detail.ts',
        output: 'classroom-schedule-detail.js'
      }
    ])
  })
})
