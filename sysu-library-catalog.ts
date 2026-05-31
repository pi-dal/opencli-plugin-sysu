import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LIBRARY_DOMAIN,
  extractCatalogResultsScript,
  buildCatalogSearchUrl,
  waitForLibraryContent,
  type CatalogRecord
} from './src/lib/sysu-library'

cli({
  site: 'sysu',
  name: 'library-catalog',
  description: 'SYSU Library catalog search — search print/electronic collections',
  access: 'read',
  defaultFormat: 'plain',
  domain: LIBRARY_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'query', positional: true, required: true, help: 'Search keyword' },
    { name: 'type', help: 'Search type: title (default), author, subject, isbn, all' }
  ],
  func: async (page: any, kwargs: any) => {
    const query = String(kwargs.query)
    const searchType = (kwargs.type as string) || 'title'
    const searchUrl = buildCatalogSearchUrl({ query, type: searchType as any })

    await page.goto(searchUrl)
    await page.evaluate(waitForLibraryContent())
    const results: CatalogRecord[] = await page.evaluate(extractCatalogResultsScript())

    return results
  }
})
