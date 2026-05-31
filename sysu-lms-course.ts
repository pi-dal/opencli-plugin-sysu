import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LMS_DOMAIN,
  extractCourseNameScript,
  extractSectionsScript,
  waitForContent,
  type MoodleSection
} from './src/lib/sysu-lms'

cli({
  site: 'sysu',
  name: 'lms-course',
  description: 'SYSU Moodle course — list sections and activities',
  access: 'read',
  defaultFormat: 'plain',
  domain: LMS_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'id', positional: true, required: true, help: 'Moodle course ID' }
  ],
  func: async (page: any, kwargs: any) => {
    const courseId = String(kwargs.id)
    const courseUrl = `https://${LMS_DOMAIN}/course/view.php?id=${courseId}`
    await page.goto(courseUrl)
    await page.evaluate(waitForContent())
    const name: string = await page.evaluate(extractCourseNameScript())
    const sections: MoodleSection[] = await page.evaluate(extractSectionsScript())
    return { name, sections }
  }
})
