import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  SYSU_ENDPOINTS,
  buildJwxtGetScript
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-notifications',
  description: 'SYSU notifications — announcements and messages from jwxt system',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.timetable,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [],
  func: async (page: any, _kwargs: any) => {
    const script = buildJwxtGetScript(SYSU_ENDPOINTS.notifications)
    const data = await page.evaluate(script)
    return data
  }
})
