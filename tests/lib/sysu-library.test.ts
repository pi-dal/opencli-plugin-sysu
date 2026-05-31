import { describe, expect, it } from 'vitest'

import {
  LIBRARY_DOMAIN,
  LIBRARY_NAVIGATE_URLS,
  waitForLibraryContent,
  extractDatabasesScript,
  extractCatalogResultsScript,
  extractSearchResultsScript,
  extractCatalogItemDetailScript,
  buildCatalogSearchUrl,
  buildCatalogDetailUrl,
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

describe('extractSearchResultsScript', () => {
  it('returns a search results extraction script', () => {
    const script = extractSearchResultsScript()
    expect(script).toContain('querySelectorAll')
    expect(script).toContain('title')
    expect(script).toContain('url')
    expect(script.length).toBeGreaterThan(100)
  })
})

describe('extractCatalogItemDetailScript', () => {
  it('returns a catalog item detail extraction script', () => {
    const script = extractCatalogItemDetailScript()
    expect(script).toContain('getLabel')
    expect(script).toContain('title')
    expect(script).toContain('callNumber')
    expect(script).toContain('status')
  })
})

describe('buildCatalogDetailUrl', () => {
  it('passes through full URLs', () => {
    const url = buildCatalogDetailUrl('http://10.8.11.130:8991/F/-?func=full-set&set=1')
    expect(url).toBe('http://10.8.11.130:8991/F/-?func=full-set&set=1')
  })

  it('wraps numeric IDs into INNOPAC detail URLs', () => {
    const url = buildCatalogDetailUrl('12345')
    expect(url).toContain('/F/-?func=full-set-set')
    expect(url).toContain('set_number=12345')
    expect(url).toContain('format=999')
  })
})
