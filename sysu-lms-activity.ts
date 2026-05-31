import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LMS_DOMAIN,
  extractActivityDetailScript,
  waitForContent
} from './src/lib/sysu-lms'

cli({
  site: 'sysu',
  name: 'lms-activity',
  description: 'SYSU Moodle activity detail — view assignment/quiz/forum/resource details',
  domain: LMS_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'url-or-id', positional: true, required: true, help: 'Activity page URL or numeric activity ID' }
  ],
  func: async (page: any, kwargs: any) => {
    const input = String(kwargs.urlOrId)
    const activityUrl = input.startsWith('http://') || input.startsWith('https://')
      ? input
      : `https://${LMS_DOMAIN}/mod/fsresource/view.php?id=${input}`

    await page.goto(activityUrl)
    await page.evaluate(waitForContent())
    const detail = await page.evaluate(extractActivityDetailScript())

    return detail
  }
})
