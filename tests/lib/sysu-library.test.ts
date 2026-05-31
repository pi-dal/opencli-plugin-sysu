import { describe, expect, it } from 'vitest'

import {
  LIBRARY_DOMAIN,
  LIBRARY_NAVIGATE_URLS,
  waitForLibraryContent,
  extractDatabasesScript,
  extractCatalogResultsScript,
  buildCatalogSearchUrl,
  buildLiteratureSearchUrl
} from '../../src/lib/sysu-library'

describe('LIBRARY_DOMAIN', () => {
  it('points to library.sysu.edu.cn', () => {
    expect(LIBRARY_DOMAIN).toBe('library.sysu.edu.cn')
  })
})

describe('LIBRARY_NAVIGATE_URLS', () => {
  it('has a databases URL', () => {
    expect(LIBRARY_NAVIGATE_URLS.databases).toContain('/page/3640')
  })

  it('has a catalog URL', () => {
    expect(LIBRARY_NAVIGATE_URLS.catalog).toContain('/F/-?func=find-b-0')
  })
})

describe('waitForLibraryContent', () => {
  it('returns an executable script string', () => {
    const script = waitForLibraryContent()
    expect(script).toContain('#main-content')
    expect(script).toContain('[role="main"]')
  })
})

describe('extractDatabasesScript', () => {
  it('returns a database extraction script', () => {
    const script = extractDatabasesScript()
    expect(script).toContain('resource-item')
    expect(script).toContain('database-item')
    expect(script).toContain('querySelectorAll')
    expect(script).toContain('seen')
    expect(script.length).toBeGreaterThan(100)
  })
})

describe('extractCatalogResultsScript', () => {
  it('extracts catalog results with title, author, call number', () => {
    const script = extractCatalogResultsScript()
    expect(script).toContain('title')
    expect(script).toContain('author')
    expect(script).toContain('callNumber')
    expect(script).toContain('status')
    expect(script).toContain('location')
  })
})

describe('buildCatalogSearchUrl', () => {
  it('builds a title search URL', () => {
    const url = buildCatalogSearchUrl({ query: 'machine learning' })
    expect(url).toContain('find_code=WRD')
    expect(url).toContain('request=machine%20learning')
    expect(url).toContain('local_base=ZSU09')
  })

  it('builds an author search URL', () => {
    const url = buildCatalogSearchUrl({ query: 'Turing', type: 'author' })
    expect(url).toContain('find_code=AWRD')
    expect(url).toContain('request=Turing')
  })
})
