import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LIBRARY_DOMAIN,
  extractCatalogItemDetailScript,
  buildCatalogDetailUrl,
  waitForLibraryContent,
  type CatalogItemDetail
} from './src/lib/sysu-library'

cli({
  site: 'sysu',
  name: 'library-item',
  description: 'SYSU Library catalog item detail — view full record metadata from INNOPAC',
  access: 'read',
  domain: LIBRARY_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'catalog-url-or-id', positional: true, required: true, help: 'INNOPAC detail URL or catalog record ID' }
  ],
  func: async (page: any, kwargs: any) => {
    const kw = kwargs.catalogUrlOrId || kwargs['catalog-url-or-id'] || ''
    const input = String(kw)
    const detailUrl = buildCatalogDetailUrl(input)

    await page.goto(detailUrl)
    await page.evaluate(waitForLibraryContent())
    const detail: CatalogItemDetail = await page.evaluate(extractCatalogItemDetailScript())

    return detail
  }
})
