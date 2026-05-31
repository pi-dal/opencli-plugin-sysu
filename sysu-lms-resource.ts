import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LMS_DOMAIN,
  extractResourceScript,
  waitForContent,
  type MoodleResourceInfo
} from './src/lib/sysu-lms'

function resolveResourceUrl(input: string): string {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input
  }

  // try video resource (fsresource) first, then fallback to regular resource
  // use fsresource path since that's the primary video delivery on SYSU Moodle
  return `https://${LMS_DOMAIN}/mod/fsresource/view.php?id=${input}`
}

cli({
  site: 'sysu',
  name: 'lms-resource',
  description: 'SYSU Moodle resource — extract file/video/page details',
  access: 'read',
  domain: LMS_DOMAIN,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'url-or-id', positional: true, required: true, help: 'Resource page URL or numeric resource ID' }
  ],
  func: async (page: any, kwargs: any) => {
    const resourceUrl = resolveResourceUrl(String(kwargs.urlOrId))
    await page.goto(resourceUrl)
    await page.evaluate(waitForContent())
    const info: MoodleResourceInfo = await page.evaluate(extractResourceScript())
    return info
  }
})
