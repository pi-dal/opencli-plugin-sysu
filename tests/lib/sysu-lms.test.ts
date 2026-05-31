import vm from 'node:vm'

import { describe, expect, it } from 'vitest'

import {
  LMS_DOMAIN,
  LMS_NAVIGATE_URLS,
  waitForContent,
  extractCoursesScript,
  extractCourseNameScript,
  extractSectionsScript,
  extractResourceScript,
  extractActivityDetailScript
} from '../../src/lib/sysu-lms'

describe('LMS_DOMAIN', () => {
  it('points to lms.sysu.edu.cn', () => {
    expect(LMS_DOMAIN).toBe('lms.sysu.edu.cn')
  })
})

describe('LMS_NAVIGATE_URLS', () => {
  it('has a dashboard URL', () => {
    expect(LMS_NAVIGATE_URLS.dashboard).toMatch(/^https:\/\/lms\.sysu\.edu\.cn\/my\//)
  })
})

describe('waitForContent', () => {
  it('returns an IIFE string', () => {
    const script = waitForContent()
    expect(script).toContain('async')
    expect(script).toContain('region-main')
    expect(script).toContain('[role="main"]')
  })
})

describe('runtime script shape', () => {
  it('emits page.evaluate scripts that compile as standalone browser scripts', () => {
    const scripts = [
      waitForContent(),
      extractCoursesScript(),
      extractSectionsScript(),
      extractResourceScript()
    ]

    for (const script of scripts) {
      expect(() => new vm.Script(script)).not.toThrow()
    }
  })
})

describe('extractCoursesScript', () => {
  it('returns executable JS that finds enrolled courses via course/view.php links', () => {
    const script = extractCoursesScript()
    expect(script).toContain('course/view.php')
    expect(script).toContain('id:')
    expect(script).toContain('name:')
    expect(script).toContain('url:')
  })

  it('deduplicates by course id and rejects entries without a valid course ID', () => {
    const script = extractCoursesScript()
    expect(script).toContain('seen')
    expect(script).toContain('has(id)')
    expect(script).toContain('.filter(c => c.id)')
  })

  it('only treats course/view.php links as dashboard course entries', () => {
    const script = extractCoursesScript()
    expect(script).toContain('querySelectorAll(\'a[href*="course/view.php"]\')')
    expect(script).not.toContain("querySelector('a')")
  })
})

describe('extractCourseNameScript', () => {
  it('returns executable JS that extracts the page h1', () => {
    const script = extractCourseNameScript()
    expect(script).toContain('h1')
    expect(script).toContain('document.title')
  })
})

describe('extractSectionsScript', () => {
  it('returns executable JS string that extracts sections and modules', () => {
    const script = extractSectionsScript()
    expect(script).toContain('.section.main')
    expect(script).toContain('.sectionname')
    expect(script).toContain('.activity')
    expect(script).toContain('modtype_')
    expect(script).toContain('section')
    expect(script).toContain('modules')
  })

  it('extracts module type, name, url, and modId', () => {
    const script = extractSectionsScript()
    expect(script).toContain('type:')
    expect(script).toContain('name:')
    expect(script).toContain('url:')
    expect(script).toContain('modId:')
  })
})

describe('extractResourceScript', () => {
  it('returns executable JS string that extracts resource details', () => {
    const script = extractResourceScript()
    expect(script).toContain('resource.type')
    expect(script).toContain('resource.name')
    expect(script).toContain('location.href')
  })

  it('detects file type from body class and URL path', () => {
    const script = extractResourceScript()
    expect(script).toContain('modtype_resource')
    expect(script).toContain('/mod/resource/')
    expect(script).toContain('modtype_page')
    expect(script).toContain('modtype_url')
    expect(script).toContain('modtype_folder')
    expect(script).toContain('modtype_fsresource')
    expect(script).toContain('/mod/fsresource/')
  })

  it('extracts download URL from pluginfile.php links', () => {
    const script = extractResourceScript()
    expect(script).toContain('pluginfile.php')
    expect(script).toContain('downloadUrl')
  })

  it('detects video player and optional rate control', () => {
    const script = extractResourceScript()
    expect(script).toContain('hasPlayer')
    expect(script).toContain('hasRateControl')
    expect(script).toContain('video')
  })

  it('falls back to video src when no download link is found', () => {
    const script = extractResourceScript()
    expect(script).toContain('video.getAttribute')
    expect(script).toContain('source')
    expect(script).toContain('downloadUrl')
  })
})

describe('extractActivityDetailScript', () => {
  it('returns generic activity extraction script without assignment/quiz-specific fields', () => {
    const script = extractActivityDetailScript()
    expect(script).toContain('modtype_assign')
    expect(script).toContain('modtype_quiz')
    expect(script).toContain('modtype_forum')
    expect(script).toContain('modtype_fsresource')
    expect(script).toContain('description')
    expect(script).toContain('pluginfile.php')
    // no assignment/quiz-specific sub-objects
    expect(script).not.toContain('submission')
    expect(script).not.toContain('dueDate')
  })
})
