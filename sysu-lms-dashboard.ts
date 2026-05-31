import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LMS_DOMAIN,
  LMS_NAVIGATE_URLS,
  extractCoursesScript,
  waitForContent,
  type MoodleCourse
} from './src/lib/sysu-lms'

cli({
  site: 'sysu',
  name: 'lms-dashboard',
  description: 'SYSU Moodle dashboard — list enrolled courses',
  domain: LMS_DOMAIN,
  navigateBefore: LMS_NAVIGATE_URLS.dashboard,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [],
  func: async (page: any, _kwargs: any) => {
    await page.evaluate(waitForContent())
    const raw: MoodleCourse[] = await page.evaluate(extractCoursesScript())
    return raw
  }
})
