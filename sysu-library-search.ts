import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LIBRARY_DOMAIN,
  extractSearchResultsScript,
  waitForLibraryContent,
  buildLiteratureSearchUrl,
  type SearchResult
} from './src/lib/sysu-library'

cli({
  site: 'sysu',
  name: 'library-search',
  description: 'SYSU Library literature search — one-stop search of print and electronic resources',
  access: 'read',
  domain: LIBRARY_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'query', positional: true, required: true, help: 'Search keyword' }
  ],
  func: async (page: any, kwargs: any) => {
    const query = String(kwargs.query)
    const searchUrl = buildLiteratureSearchUrl(query)

    await page.goto(searchUrl)
    await new Promise(r => setTimeout(r, 3000))
    await page.evaluate(waitForLibraryContent())
    const results: SearchResult[] = await page.evaluate(extractSearchResultsScript())

    return results
  }
})
