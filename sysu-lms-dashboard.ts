import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  LMS_DOMAIN,
  LMS_NAVIGATE_URLS,
  fetchDashboardCoursesScript,
  extractCoursesScript,
  waitForDashboardCourses,
  waitForContent,
  type MoodleCourse
} from './src/lib/sysu-lms'

cli({
  site: 'sysu',
  name: 'lms-dashboard',
  description: 'SYSU Moodle dashboard — list enrolled courses',
  access: 'read',
  defaultFormat: 'plain',
  domain: LMS_DOMAIN,
  navigateBefore: LMS_NAVIGATE_URLS.dashboard,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [],
  func: async (page: any, _kwargs: any) => {
    await page.evaluate(waitForDashboardCourses())

    // First try the core AJAX web service API
    const apiCourses: MoodleCourse[] = await page.evaluate(fetchDashboardCoursesScript())
    if (apiCourses.length > 0) return apiCourses

    // Fallback: poll DOM for AJAX-rendered course cards in myoverview block
    const raw: MoodleCourse[] = await page.evaluate(extractCoursesScript())
    if (raw.length > 0) return raw

    // Last resort: navigate to the server-rendered "/my/courses.php" page list
    await page.goto('https://' + LMS_DOMAIN + '/my/courses.php')
    await page.evaluate(waitForContent())
    const seen = new Set<string>()
    const links = await page.evaluate(`
(() => {
  const results = [];
  const s = new Set();
  const all = document.querySelectorAll('a[href*="course/view.php?id="]');
  for (const a of all) {
    const href = a.getAttribute('href') || '';
    const id = href.match(/id=(\\d+)/)?.[1];
    if (!id || s.has(id)) continue;
    s.add(id);
    const name = (a.getAttribute('title') || a.textContent || '').trim();
    if (name && id) results.push({ id, name, url: href });
  }
  return results;
})()
    `)
    return links
  }
})
