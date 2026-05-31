import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LIBRARY_DOMAIN,
  LIBRARY_NAVIGATE_URLS,
  extractDatabasesScript,
  waitForLibraryContent,
  type DatabaseInfo
} from './src/lib/sysu-library'

cli({
  site: 'sysu',
  name: 'library-databases',
  description: 'SYSU Library database listing — browse/search subscribed databases',
  access: 'read',
  defaultFormat: 'plain',
  domain: LIBRARY_DOMAIN,
  navigateBefore: LIBRARY_NAVIGATE_URLS.databases,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'keyword', help: 'Filter databases by keyword' }
  ],
  func: async (page: any, kwargs: any) => {
    await page.evaluate(waitForLibraryContent())
    let databases: DatabaseInfo[] = await page.evaluate(extractDatabasesScript())

    // client-side filter by keyword
    if (kwargs.keyword) {
      const kw = String(kwargs.keyword).toLowerCase()
      databases = databases.filter(
        (db) =>
          db.name.toLowerCase().includes(kw) ||
          (db.description && db.description.toLowerCase().includes(kw))
      )
    }

    return databases
  }
})
