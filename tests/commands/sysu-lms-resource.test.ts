import { describe, expect, it } from 'vitest'

import { extractResourceScript } from '../../src/lib/sysu-lms'

describe('sysu-lms resource', () => {
  it('detects resource type from URL path and body class', () => {
    const script = extractResourceScript()
    expect(script).toContain('modtype_resource')
    expect(script).toContain('modtype_page')
    expect(script).toContain('modtype_url')
    expect(script).toContain('modtype_folder')
  })

  it('extracts pluginfile download URL when available', () => {
    const script = extractResourceScript()
    expect(script).toContain('pluginfile.php')
    expect(script).toContain('downloadUrl')
  })

  it('detects video player with rate control info', () => {
    const script = extractResourceScript()
    expect(script).toContain('hasPlayer')
    expect(script).toContain('hasRateControl')
    expect(script).toContain('video')
    expect(script).toContain('source')
  })

  it('does not conflate download URL with playback', () => {
    const script = extractResourceScript()
    // playback and downloadUrl are separate fields
    expect(script).toContain('playback')
    expect(script).toContain('downloadUrl')
  })
})
