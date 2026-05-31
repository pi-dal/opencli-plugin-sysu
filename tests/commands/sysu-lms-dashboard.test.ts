import { describe, expect, it } from 'vitest'

import { extractCoursesScript, LMS_NAVIGATE_URLS } from '../../src/lib/sysu-lms'

describe('sysu-lms dashboard', () => {
  it('navigates to /my/ for dashboard', () => {
    expect(LMS_NAVIGATE_URLS.dashboard).toContain('/my/')
  })

  it('returns courses with id, name, url from dashboard DOM', () => {
    const script = extractCoursesScript()
    expect(script).toContain('id:')
    expect(script).toContain('name:')
    expect(script).toContain('url:')
  })

  it('makes summary optional', () => {
    const script = extractCoursesScript()
    expect(script).toContain('summary')
    expect(script).toContain('|| undefined')
  })
})
