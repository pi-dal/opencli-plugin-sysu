import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LMS_DOMAIN,
  extractActivityDetailScript,
  waitForContent
} from './src/lib/sysu-lms'

cli({
  site: 'sysu',
  name: 'lms-activity',
  description: 'SYSU Moodle activity detail — view assignment/quiz/forum/resource details by activity URL',
  access: 'read',
  defaultFormat: 'plain',
  domain: LMS_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'url', positional: true, required: true, help: 'Full activity page URL (e.g. /mod/assign/view.php?id=42 or /mod/quiz/view.php?id=42)' }
  ],
  func: async (page: any, kwargs: any) => {
    const activityUrl = String(kwargs.url)

    await page.goto(activityUrl)
    await page.evaluate(waitForContent())
    const detail = await page.evaluate(extractActivityDetailScript())

    return detail
  }
})
