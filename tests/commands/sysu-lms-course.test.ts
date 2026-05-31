import { describe, expect, it } from 'vitest'

import { extractSectionsScript } from '../../src/lib/sysu-lms'

describe('sysu-lms course', () => {
  it('extracts sections with name and modules from course page', () => {
    const script = extractSectionsScript()
    expect(script).toContain('.section.main')
    expect(script).toContain('.sectionname')
    expect(script).toContain('.activity')
    expect(script).toContain('type:')
    expect(script).toContain('name:')
    expect(script).toContain('url:')
    expect(script).toContain('modId:')
  })

  it('filters out empty sections', () => {
    const script = extractSectionsScript()
    expect(script).toContain('modules.length > 0')
  })
})
